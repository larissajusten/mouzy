import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Create a registry to register all metrics
export const register = new Registry();

// Game-specific metrics
export const activeRooms = new Gauge({
  name: 'game_active_rooms',
  help: 'Number of active game rooms',
  registers: [register]
});

export const activePlayers = new Gauge({
  name: 'game_active_players',
  help: 'Number of active players across all rooms',
  registers: [register]
});

export const websocketConnections = new Gauge({
  name: 'websocket_connections',
  help: 'Number of active WebSocket connections',
  registers: [register]
});

export const gamesStarted = new Counter({
  name: 'game_started_total',
  help: 'Total number of games started',
  registers: [register]
});

export const gamesEnded = new Counter({
  name: 'game_ended_total',
  help: 'Total number of games ended',
  registers: [register]
});

export const roomsCreated = new Counter({
  name: 'room_created_total',
  help: 'Total number of rooms created',
  registers: [register]
});

export const playersJoined = new Counter({
  name: 'player_joined_total',
  help: 'Total number of players joined',
  registers: [register]
});

export const itemsCollected = new Counter({
  name: 'item_collected_total',
  help: 'Total number of items collected',
  labelNames: ['correct'],
  registers: [register]
});

export const websocketMessages = new Counter({
  name: 'websocket_messages_total',
  help: 'Total number of WebSocket messages received',
  labelNames: ['type'],
  registers: [register]
});

export const websocketMessageDuration = new Histogram({
  name: 'websocket_message_duration_seconds',
  help: 'Duration of WebSocket message processing in seconds',
  labelNames: ['type'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
});

export const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// Register default metrics (CPU, memory, etc.)
register.setDefaultLabels({
  app: 'ratinho-caca-letras'
});

