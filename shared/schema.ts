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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'collection' | 'accuracy' | 'speed' | 'difficulty' | 'social';
  requirement: number;
  unlockedAt?: number;
}

export interface PlayerProgress {
  playerId: string;
  playerName: string;
  totalGamesPlayed: number;
  totalItemsCollected: number;
  totalCorrectAttempts: number;
  totalAttempts: number;
  highestScore: number;
  difficultiesCompleted: Set<DifficultyLevel>;
  uniqueOpponents: Set<string>;
  achievements: Achievement[];
  lastPlayedAt: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    name: 'Primeiros Passos',
    description: 'Colete seu primeiro item',
    icon: 'Footprints',
    category: 'collection',
    requirement: 1,
  },
  {
    id: 'collector-bronze',
    name: 'Colecionador de Bronze',
    description: 'Colete 10 itens',
    icon: 'Award',
    category: 'collection',
    requirement: 10,
  },
  {
    id: 'collector-silver',
    name: 'Colecionador de Prata',
    description: 'Colete 50 itens',
    icon: 'Medal',
    category: 'collection',
    requirement: 50,
  },
  {
    id: 'collector-gold',
    name: 'Colecionador de Ouro',
    description: 'Colete 100 itens',
    icon: 'Trophy',
    category: 'collection',
    requirement: 100,
  },
  {
    id: 'sharp-shooter',
    name: 'Atirador de Elite',
    description: 'Acerte 90% das teclas em uma partida',
    icon: 'Target',
    category: 'accuracy',
    requirement: 90,
  },
  {
    id: 'perfect-game',
    name: 'Jogo Perfeito',
    description: 'Acerte 100% das teclas em uma partida',
    icon: 'Star',
    category: 'accuracy',
    requirement: 100,
  },
  {
    id: 'vowel-master',
    name: 'Mestre das Vogais',
    description: 'Complete uma partida no nível Vogais',
    icon: 'BookA',
    category: 'difficulty',
    requirement: 1,
  },
  {
    id: 'consonant-champion',
    name: 'Campeão das Consoantes',
    description: 'Complete uma partida no nível Consoantes',
    icon: 'BookOpen',
    category: 'difficulty',
    requirement: 2,
  },
  {
    id: 'uppercase-hero',
    name: 'Herói das Maiúsculas',
    description: 'Complete uma partida no nível Maiúsculas',
    icon: 'BookMarked',
    category: 'difficulty',
    requirement: 3,
  },
  {
    id: 'symbol-legend',
    name: 'Lenda dos Símbolos',
    description: 'Complete uma partida no nível Símbolos',
    icon: 'Sparkles',
    category: 'difficulty',
    requirement: 4,
  },
  {
    id: 'social-butterfly',
    name: 'Borboleta Social',
    description: 'Jogue com 5 jogadores diferentes',
    icon: 'Users',
    category: 'social',
    requirement: 5,
  },
  {
    id: 'dedicated-player',
    name: 'Jogador Dedicado',
    description: 'Complete 10 partidas',
    icon: 'Gamepad2',
    category: 'collection',
    requirement: 10,
  },
  {
    id: 'high-scorer',
    name: 'Pontuador Estrela',
    description: 'Alcance 50 pontos em uma partida',
    icon: 'Star',
    category: 'collection',
    requirement: 50,
  },
];
