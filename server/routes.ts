import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { CreateRoomInput, createRoomSchema, JoinRoomInput, joinRoomSchema, WebSocketMessage, PlayerStats, DifficultyLevel } from "@shared/schema";
import { logger } from "./lib/logger";
import { Sentry } from "./lib/sentry";
import { 
  register, 
  activeRooms, 
  activePlayers, 
  websocketConnections, 
  gamesStarted, 
  gamesEnded, 
  roomsCreated, 
  playersJoined, 
  itemsCollected, 
  websocketMessages, 
  websocketMessageDuration 
} from "./lib/metrics";

interface WSClient extends WebSocket {
  roomCode?: string;
  playerId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Metrics endpoint for Prometheus
  app.get("/metrics", async (_req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      logger.error('Error generating metrics', { error });
      res.status(500).end();
    }
  });

  app.post("/api/rooms/create", async (req, res) => {
    try {
      const input = createRoomSchema.parse(req.body) as CreateRoomInput;
      const { room, playerId } = await storage.createRoom(
        input.playerName,
        input.timerDuration,
        input.difficulty as DifficultyLevel
      );
      roomsCreated.inc();
      logger.info('Room created', { roomCode: room.code, playerId, difficulty: input.difficulty });
      res.json({ code: room.code, playerId });
    } catch (error) {
      logger.error('Failed to create room', { error });
      res.status(400).json({ error: 'Failed to create room' });
    }
  });

  app.post("/api/rooms/join", async (req, res) => {
    try {
      const input = joinRoomSchema.parse(req.body) as JoinRoomInput;
      const { room, playerId } = await storage.joinRoom(input.roomCode, input.playerName);
      playersJoined.inc();
      logger.info('Player joined room', { roomCode: input.roomCode, playerId });
      res.json({ playerId });
    } catch (error) {
      logger.error('Failed to join room', { error, roomCode: req.body.roomCode });
      res.status(400).json({ error: 'Failed to join room' });
    }
  });

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const rooms = new Map<string, Set<WSClient>>();
  const timers = new Map<string, NodeJS.Timeout>();
  const disconnectTimers = new Map<string, NodeJS.Timeout>(); // playerId -> timeout
  const roomCleanupTimers = new Map<string, NodeJS.Timeout>(); // roomCode -> timeout for empty room cleanup
  const itemRespawnTimers = new Map<string, NodeJS.Timeout>(); // itemId -> timeout for respawn

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
    
    itemRespawnTimers.forEach((timer, itemId) => {
      clearTimeout(timer);
      itemRespawnTimers.delete(itemId);
    });
    
    if (room) {
      gamesEnded.inc();
      const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
      const stats: PlayerStats[] = sortedPlayers.map((player, index) => ({
        position: index + 1,
        player,
        accuracy: player.totalAttempts > 0 
          ? (player.correctAttempts / player.totalAttempts) * 100 
          : 0,
        timeElapsed: room.startedAt ? Math.floor((Date.now() - room.startedAt) / 1000) : 0,
      }));

      logger.info('Game ended', { 
        roomCode, 
        players: room.players.length,
        topScore: sortedPlayers[0]?.score || 0
      });

      broadcastToRoom(roomCode, { type: 'game-ended', stats });
      
      const clients = rooms.get(roomCode);
      if (clients) {
        clients.forEach(client => {
          sendRoomState(client, roomCode);
        });
      }
    }
  }

  // Update metrics periodically
  setInterval(() => {
    activeRooms.set(rooms.size);
    let totalPlayers = 0;
    rooms.forEach((clients) => {
      totalPlayers += clients.size;
    });
    activePlayers.set(totalPlayers);
    websocketConnections.set(wss.clients.size);
  }, 5000); // Update every 5 seconds

  wss.on('connection', (ws: WSClient) => {
    websocketConnections.inc();
    logger.debug('WebSocket connection opened');

    ws.on('message', async (data: Buffer) => {
      const startTime = Date.now();
      try {
        const message = JSON.parse(data.toString());
        const messageType = message.type || 'unknown';

        // Track message metrics
        websocketMessages.inc({ type: messageType });

        switch (message.type) {
          case 'join-room': {
            const { roomCode, playerId } = message;
            ws.roomCode = roomCode;
            ws.playerId = playerId;

            if (roomCleanupTimers.has(roomCode)) {
              clearTimeout(roomCleanupTimers.get(roomCode));
              roomCleanupTimers.delete(roomCode);
              logger.debug(`Cancelled empty-room cleanup timer for room ${roomCode}`);
            }

            if (playerId) {
              const disconnectTimerKey = `${roomCode}:${playerId}`;
              if (disconnectTimers.has(disconnectTimerKey)) {
                clearTimeout(disconnectTimers.get(disconnectTimerKey));
                disconnectTimers.delete(disconnectTimerKey);
                logger.debug('Player reconnected', { playerId, roomCode });
              } else {
                logger.debug('Player joined room', { playerId, roomCode });
              }
            } else {
              logger.debug('Client joined room for viewing results', { roomCode });
            }

            if (!rooms.has(roomCode)) {
              rooms.set(roomCode, new Set());
            }
            rooms.get(roomCode)!.add(ws);
            
            const clients = rooms.get(roomCode);
            if (clients) {
              clients.forEach(client => {
                sendRoomState(client, roomCode);
              });
            }
            break;
          }

          case 'start-game': {
            const { roomCode } = message;
            gamesStarted.inc();
            const items = await storage.startGame(roomCode);
            const room = await storage.getRoom(roomCode);
            
            if (room) {
              logger.info('Game started', { roomCode, players: room.players.length, items: items.length });
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
            
            itemsCollected.inc({ correct: correct ? 'true' : 'false' });
            
            broadcastToRoom(roomCode, {
              type: 'item-collected',
              itemId,
              playerId,
              correct,
              newScore,
            });

            const respawnTimer = setTimeout(async () => {
              const newItem = await storage.respawnItem(roomCode);
              if (newItem) {
                broadcastToRoom(roomCode, {
                  type: 'item-respawned',
                  item: newItem,
                });
              }
              itemRespawnTimers.delete(itemId);
            }, 5000);
            
            itemRespawnTimers.set(itemId, respawnTimer);

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

              console.log(`Sending game-ended with ${stats.length} player stats`);
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'game-ended', stats } as WebSocketMessage));
              } else {
                console.warn(`WebSocket not open, readyState: ${ws.readyState}`);
              }
            } else {
              console.warn(`Room ${roomCode} not found`);
            }
            break;
          }
        }

        // Record message processing duration
        const duration = (Date.now() - startTime) / 1000;
        websocketMessageDuration.observe({ type: messageType }, duration);
      } catch (error: any) {
        logger.error('WebSocket message error', { error, message: data.toString() });
        
        // Capture error in Sentry
        Sentry.captureException(error, {
          tags: {
            type: 'websocket',
            messageType: messageType || 'unknown',
          },
          extra: {
            message: data.toString(),
            roomCode: ws.roomCode,
            playerId: ws.playerId,
          }
        });
      }
    });

    ws.on('close', async () => {
      websocketConnections.dec();
      if (ws.roomCode && ws.playerId) {
        const clients = rooms.get(ws.roomCode);
        if (clients) {
          clients.delete(ws);
          logger.debug('Player disconnected', { 
            playerId: ws.playerId, 
            roomCode: ws.roomCode, 
            remainingClients: clients.size 
          });

          if (clients.size === 0) {
            const roomCode = ws.roomCode;
            if (roomCleanupTimers.has(roomCode)) {
              clearTimeout(roomCleanupTimers.get(roomCode));
              roomCleanupTimers.delete(roomCode);
            }
            const timeout = setTimeout(async () => {
              const currentClients = rooms.get(roomCode);
              if (!currentClients || currentClients.size === 0) {
                rooms.delete(roomCode);
                const timer = timers.get(roomCode);
                if (timer) {
                  clearInterval(timer);
                  timers.delete(roomCode);
                }

                itemRespawnTimers.forEach((respawnTimer, itemId) => {
                  clearTimeout(respawnTimer);
                  itemRespawnTimers.delete(itemId);
                });
                await storage.deleteRoom(roomCode);
              }
              roomCleanupTimers.delete(roomCode);
            }, 5000); // 5 segundos
            roomCleanupTimers.set(roomCode, timeout);
          } else {
            const roomCode = ws.roomCode;
            const playerId = ws.playerId;
            const disconnectTimerKey = `${roomCode}:${playerId}`;
            const timeout = setTimeout(async () => {
              await storage.removePlayer(roomCode, playerId);
              broadcastToRoom(roomCode, { 
                type: 'player-left', 
                playerId 
              });
              disconnectTimers.delete(disconnectTimerKey);
            }, 30000); // 30 segundos
            
            disconnectTimers.set(disconnectTimerKey, timeout);
          }
        }
      }
    });
  });

  return httpServer;
}
