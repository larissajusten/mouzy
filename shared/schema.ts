import { z } from "zod";

export const DifficultyLevel = {
  VOGAIS: 1,
  CONSOANTES: 2,
  MAIUSCULAS: 3,
  SIMBOLOS: 4,
} as const;

export type DifficultyLevel = typeof DifficultyLevel[keyof typeof DifficultyLevel];

export interface Position {
  x: number;
  y: number;
}

export interface CollectibleItem {
  id: string;
  type: 'cheese-small' | 'cheese-medium' | 'apple' | 'bread';
  position: Position;
  letter: string;
  difficultyLevel: DifficultyLevel;
  points: number;
  requiresShift: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  position: Position;
  itemsCollected: number;
  correctAttempts: number;
  totalAttempts: number;
}

export interface GameRoom {
  code: string;
  hostId: string;
  players: Player[];
  items: CollectibleItem[];
  gameState: 'waiting' | 'playing' | 'finished';
  timerDuration: number | null;
  timeRemaining: number | null;
  startedAt: number | null;
  difficulty: DifficultyLevel;
  createdAt: number;
}

export interface PlayerStats {
  position: number;
  player: Player;
  accuracy: number;
  timeElapsed: number;
}

export const createRoomSchema = z.object({
  playerName: z.string().min(1).max(20),
  timerDuration: z.number().nullable(),
  difficulty: z.number().min(1).max(4),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const joinRoomSchema = z.object({
  playerName: z.string().min(1).max(20),
  roomCode: z.string().length(6),
});

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;

export type WebSocketMessage =
  | { type: 'player-joined'; player: Player }
  | { type: 'player-left'; playerId: string }
  | { type: 'player-moved'; playerId: string; position: Position }
  | { type: 'game-started'; items: CollectibleItem[]; startedAt: number }
  | { type: 'item-collected'; itemId: string; playerId: string; correct: boolean; newScore: number }
  | { type: 'timer-update'; timeRemaining: number }
  | { type: 'game-ended'; stats: PlayerStats[] }
  | { type: 'room-state'; room: GameRoom };

export const PLAYER_COLORS = [
  '#EF4444', // red
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#A855F7', // purple
  '#F97316', // orange
  '#EC4899', // pink
  '#14B8A6', // teal
];

export const ITEM_CONFIGS = {
  'cheese-small': { minPoints: 1, maxPoints: 2, size: 48 },
  'cheese-medium': { minPoints: 3, maxPoints: 3, size: 64 },
  'apple': { minPoints: 5, maxPoints: 5, size: 56 },
  'bread': { minPoints: 5, maxPoints: 5, size: 60 },
} as const;
