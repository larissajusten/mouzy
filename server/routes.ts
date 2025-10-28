import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { CreateRoomInput, createRoomSchema, JoinRoomInput, joinRoomSchema, WebSocketMessage, PlayerStats } from "@shared/schema";

interface WSClient extends WebSocket {
  roomCode?: string;
  playerId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/rooms/create", async (req, res) => {
    try {
      const input = createRoomSchema.parse(req.body) as CreateRoomInput;
      const { room, playerId } = await storage.createRoom(
        input.playerName,
        input.timerDuration,
        input.difficulty
      );
      res.json({ code: room.code, playerId });
    } catch (error) {
      res.status(400).json({ error: 'Failed to create room' });
    }
  });

  app.post("/api/rooms/join", async (req, res) => {
    try {
      const input = joinRoomSchema.parse(req.body) as JoinRoomInput;
      const { room, playerId } = await storage.joinRoom(input.roomCode, input.playerName);
      res.json({ playerId });
    } catch (error) {
      res.status(400).json({ error: 'Failed to join room' });
    }
  });

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const rooms = new Map<string, Set<WSClient>>();
  const timers = new Map<string, NodeJS.Timeout>();

  function broadcastToRoom(roomCode: string, message: WebSocketMessage, excludeClient?: WSClient) {
    const clients = rooms.get(roomCode);
    if (!clients) return;

    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  async function sendRoomState(client: WSClient, roomCode: string) {
    const room = await storage.getRoom(roomCode);
    if (room && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'room-state', room } as WebSocketMessage));
    }
  }

  function startGameTimer(roomCode: string, duration: number) {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const timer = setInterval(async () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

      await storage.updateTimer(roomCode, remaining);
      broadcastToRoom(roomCode, { type: 'timer-update', timeRemaining: remaining });

      if (remaining === 0) {
        clearInterval(timer);
        timers.delete(roomCode);
        await endGame(roomCode);
      }
    }, 1000);

    timers.set(roomCode, timer);
  }

  async function endGame(roomCode: string) {
    await storage.endGame(roomCode);
    const room = await storage.getRoom(roomCode);
    
    if (room) {
      const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
      const stats: PlayerStats[] = sortedPlayers.map((player, index) => ({
        position: index + 1,
        player,
        accuracy: player.totalAttempts > 0 
          ? (player.correctAttempts / player.totalAttempts) * 100 
          : 0,
        timeElapsed: room.startedAt ? Math.floor((Date.now() - room.startedAt) / 1000) : 0,
      }));

      broadcastToRoom(roomCode, { type: 'game-ended', stats });
      
      const clients = rooms.get(roomCode);
      if (clients) {
        clients.forEach(client => {
          sendRoomState(client, roomCode);
        });
      }
    }
  }

  wss.on('connection', (ws: WSClient) => {
    console.log('WebSocket connected');
    
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('WebSocket message received:', message.type, message);

        switch (message.type) {
          case 'join-room': {
            const { roomCode, playerId } = message;
            ws.roomCode = roomCode;
            ws.playerId = playerId;

            if (!rooms.has(roomCode)) {
              rooms.set(roomCode, new Set());
            }
            rooms.get(roomCode)!.add(ws);

            console.log(`Player ${playerId} joined room ${roomCode}`);
            await sendRoomState(ws, roomCode);
            
            const room = await storage.getRoom(roomCode);
            if (room) {
              const player = room.players.find(p => p.id === playerId);
              if (player) {
                broadcastToRoom(roomCode, { type: 'player-joined', player }, ws);
              }
            }
            break;
          }

          case 'start-game': {
            const { roomCode } = message;
            console.log(`Starting game in room ${roomCode}`);
            const items = await storage.startGame(roomCode);
            const room = await storage.getRoom(roomCode);
            
            if (room) {
              console.log(`Game started for room ${roomCode}, broadcasting to ${rooms.get(roomCode)?.size} clients`);
              broadcastToRoom(roomCode, { 
                type: 'game-started', 
                items, 
                startedAt: room.startedAt! 
              });

              const clients = rooms.get(roomCode);
              if (clients) {
                clients.forEach(client => {
                  sendRoomState(client, roomCode);
                });
              }

              if (room.timerDuration) {
                startGameTimer(roomCode, room.timerDuration);
              }
            }
            break;
          }

          case 'player-move': {
            const { roomCode, playerId, position } = message;
            await storage.updatePlayerPosition(roomCode, playerId, position);
            broadcastToRoom(roomCode, { 
              type: 'player-moved', 
              playerId, 
              position 
            }, ws);
            break;
          }

          case 'collect-item': {
            const { roomCode, playerId, itemId, correct } = message;
            const { newScore } = await storage.collectItem(roomCode, playerId, itemId, correct);
            
            broadcastToRoom(roomCode, {
              type: 'item-collected',
              itemId,
              playerId,
              correct,
              newScore,
            });

            const room = await storage.getRoom(roomCode);
            if (room && room.items.length === 0 && room.gameState === 'playing') {
              const timer = timers.get(roomCode);
              if (timer) {
                clearInterval(timer);
                timers.delete(roomCode);
              }
              await endGame(roomCode);
            }
            break;
          }

          case 'get-results': {
            const { roomCode } = message;
            const room = await storage.getRoom(roomCode);
            
            if (room) {
              const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
              const stats: PlayerStats[] = sortedPlayers.map((player, index) => ({
                position: index + 1,
                player,
                accuracy: player.totalAttempts > 0 
                  ? (player.correctAttempts / player.totalAttempts) * 100 
                  : 0,
                timeElapsed: room.startedAt ? Math.floor((Date.now() - room.startedAt) / 1000) : 0,
              }));

              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'game-ended', stats } as WebSocketMessage));
              }
            }
            break;
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      if (ws.roomCode && ws.playerId) {
        const clients = rooms.get(ws.roomCode);
        if (clients) {
          clients.delete(ws);
          
          if (clients.size === 0) {
            rooms.delete(ws.roomCode);
            const timer = timers.get(ws.roomCode);
            if (timer) {
              clearInterval(timer);
              timers.delete(ws.roomCode);
            }
            await storage.deleteRoom(ws.roomCode);
          } else {
            await storage.removePlayer(ws.roomCode, ws.playerId);
            broadcastToRoom(ws.roomCode, { 
              type: 'player-left', 
              playerId: ws.playerId 
            });
          }
        }
      }
    });
  });

  return httpServer;
}
