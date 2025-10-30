import { GameRoom, Player, CollectibleItem, Position, PLAYER_COLORS, DifficultyLevel } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createRoom(hostName: string, timerDuration: number | null, difficulty: DifficultyLevel): Promise<{ room: GameRoom; playerId: string }>;
  joinRoom(roomCode: string, playerName: string): Promise<{ room: GameRoom; playerId: string }>;
  getRoom(roomCode: string): Promise<GameRoom | undefined>;
  updatePlayerPosition(roomCode: string, playerId: string, position: Position): Promise<void>;
  startGame(roomCode: string): Promise<CollectibleItem[]>;
  collectItem(roomCode: string, playerId: string, itemId: string, correct: boolean): Promise<{ newScore: number }>;
  endGame(roomCode: string): Promise<void>;
  updateTimer(roomCode: string, timeRemaining: number): Promise<void>;
  removePlayer(roomCode: string, playerId: string): Promise<void>;
  deleteRoom(roomCode: string): Promise<void>;
  respawnItem(roomCode: string): Promise<CollectibleItem | null>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, GameRoom>;

  constructor() {
    this.rooms = new Map();
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return this.rooms.has(code) ? this.generateRoomCode() : code;
  }

  private generateItems(difficulty: DifficultyLevel, count: number = 15): CollectibleItem[] {
    const items: CollectibleItem[] = [];
    const arenaWidth = 1200;
    const arenaHeight = 700;
    const minDistance = 80;

    const getRandomPosition = (): Position => {
      return {
        x: Math.random() * (arenaWidth - 100) + 50,
        y: Math.random() * (arenaHeight - 100) + 50,
      };
    };

    const isFarEnough = (pos: Position, existingPositions: Position[]): boolean => {
      return existingPositions.every(existing => {
        const distance = Math.sqrt(
          Math.pow(pos.x - existing.x, 2) + Math.pow(pos.y - existing.y, 2)
        );
        return distance >= minDistance;
      });
    };

    const letterSets = {
      [DifficultyLevel.VOGAIS]: ['a', 'e', 'i', 'o', 'u'],
      [DifficultyLevel.CONSOANTES]: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z'],
      [DifficultyLevel.MAIUSCULAS]: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      [DifficultyLevel.SIMBOLOS]: ['!', '@', '#', '$', '%', '&', '*', '(', ')', '+', '=', '<', '>', '?', ':', ';'],
    };

    const itemTypes = ['cheese-small', 'cheese-medium', 'apple', 'bread'] as const;
    const positions: Position[] = [];

    for (let i = 0; i < count; i++) {
      let position: Position;
      let attempts = 0;
      do {
        position = getRandomPosition();
        attempts++;
      } while (!isFarEnough(position, positions) && attempts < 50);

      positions.push(position);

      const letters = letterSets[difficulty];
      const letter = letters[Math.floor(Math.random() * letters.length)];
      const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      
      const points = difficulty === DifficultyLevel.VOGAIS ? 1 :
                     difficulty === DifficultyLevel.CONSOANTES ? 2 :
                     difficulty === DifficultyLevel.MAIUSCULAS ? 3 : 5;

      items.push({
        id: randomUUID(),
        type: itemType,
        position,
        letter,
        difficultyLevel: difficulty,
        points,
        requiresShift: difficulty === DifficultyLevel.MAIUSCULAS || difficulty === DifficultyLevel.SIMBOLOS,
      });
    }

    return items;
  }

  async createRoom(hostName: string, timerDuration: number | null, difficulty: DifficultyLevel): Promise<{ room: GameRoom; playerId: string }> {
    const code = this.generateRoomCode();
    const playerId = randomUUID();
    const color = PLAYER_COLORS[0];

    const player: Player = {
      id: playerId,
      name: hostName,
      color,
      score: 0,
      position: { x: 100, y: 100 },
      itemsCollected: 0,
      correctAttempts: 0,
      totalAttempts: 0,
    };

    const room: GameRoom = {
      code,
      hostId: playerId,
      players: [player],
      items: [],
      gameState: 'waiting',
      timerDuration,
      timeRemaining: timerDuration,
      startedAt: null,
      difficulty,
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    return { room, playerId };
  }

  async joinRoom(roomCode: string, playerName: string): Promise<{ room: GameRoom; playerId: string }> {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.gameState !== 'waiting') {
      throw new Error('Game already started');
    }

    const playerId = randomUUID();
    const colorIndex = room.players.length % PLAYER_COLORS.length;
    const color = PLAYER_COLORS[colorIndex];

    const player: Player = {
      id: playerId,
      name: playerName,
      color,
      score: 0,
      position: { x: 100 + room.players.length * 50, y: 100 },
      itemsCollected: 0,
      correctAttempts: 0,
      totalAttempts: 0,
    };

    room.players.push(player);
    this.rooms.set(roomCode, room);

    return { room, playerId };
  }

  async getRoom(roomCode: string): Promise<GameRoom | undefined> {
    return this.rooms.get(roomCode);
  }

  async updatePlayerPosition(roomCode: string, playerId: string, position: Position): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.position = position;
      this.rooms.set(roomCode, room);
    }
  }

  async startGame(roomCode: string): Promise<CollectibleItem[]> {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('Room not found');
    }

    const items = this.generateItems(room.difficulty);
    room.items = items;
    room.gameState = 'playing';
    room.startedAt = Date.now();
    this.rooms.set(roomCode, room);

    return items;
  }

  async collectItem(roomCode: string, playerId: string, itemId: string, correct: boolean): Promise<{ newScore: number }> {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('Room not found');
    }

    const player = room.players.find(p => p.id === playerId);
    const item = room.items.find(i => i.id === itemId);

    if (!player || !item) {
      throw new Error('Player or item not found');
    }

    player.totalAttempts++;
    
    if (correct) {
      player.score += item.points;
      player.itemsCollected++;
      player.correctAttempts++;
      room.items = room.items.filter(i => i.id !== itemId);
    }

    this.rooms.set(roomCode, room);
    return { newScore: player.score };
  }

  async endGame(roomCode: string): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.gameState = 'finished';
    this.rooms.set(roomCode, room);
  }

  async updateTimer(roomCode: string, timeRemaining: number): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.timeRemaining = timeRemaining;
    this.rooms.set(roomCode, room);
  }

  async removePlayer(roomCode: string, playerId: string): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== playerId);
    
    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
    } else {
      this.rooms.set(roomCode, room);
    }
  }

  async deleteRoom(roomCode: string): Promise<void> {
    this.rooms.delete(roomCode);
  }

  async respawnItem(roomCode: string): Promise<CollectibleItem | null> {
    const room = this.rooms.get(roomCode);
    if (!room || room.gameState !== 'playing') {
      return null;
    }

    const arenaWidth = 1200;
    const arenaHeight = 700;
    const minDistance = 80;

    const getRandomPosition = (): Position => {
      return {
        x: Math.random() * (arenaWidth - 100) + 50,
        y: Math.random() * (arenaHeight - 100) + 50,
      };
    };

    const isFarEnough = (pos: Position, existingPositions: Position[]): boolean => {
      return existingPositions.every(existing => {
        const distance = Math.sqrt(
          Math.pow(pos.x - existing.x, 2) + Math.pow(pos.y - existing.y, 2)
        );
        return distance >= minDistance;
      });
    };

    const letterSets = {
      [DifficultyLevel.VOGAIS]: ['a', 'e', 'i', 'o', 'u'],
      [DifficultyLevel.CONSOANTES]: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z'],
      [DifficultyLevel.MAIUSCULAS]: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      [DifficultyLevel.SIMBOLOS]: ['!', '@', '#', '$', '%', '&', '*', '(', ')', '+', '=', '<', '>', '?', ':', ';'],
    };

    const itemTypes = ['cheese-small', 'cheese-medium', 'apple', 'bread'] as const;
    const existingPositions = room.items.map(item => item.position);

    let position: Position;
    let attempts = 0;
    do {
      position = getRandomPosition();
      attempts++;
    } while (!isFarEnough(position, existingPositions) && attempts < 50);

    const letters = letterSets[room.difficulty];
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    
    const points = room.difficulty === DifficultyLevel.VOGAIS ? 1 :
                   room.difficulty === DifficultyLevel.CONSOANTES ? 2 :
                   room.difficulty === DifficultyLevel.MAIUSCULAS ? 3 : 5;

    const newItem: CollectibleItem = {
      id: randomUUID(),
      type: itemType,
      position,
      letter,
      difficultyLevel: room.difficulty,
      points,
      requiresShift: room.difficulty === DifficultyLevel.MAIUSCULAS || room.difficulty === DifficultyLevel.SIMBOLOS,
    };

    room.items.push(newItem);
    this.rooms.set(roomCode, room);

    return newItem;
  }
}

export const storage = new MemStorage();
