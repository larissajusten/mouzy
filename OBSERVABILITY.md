# Observability & Metrics Guide

## Recommended Libraries

### 1. **Logging: Winston** (Most Popular)
- **Package**: `winston`
- **Why**: Structured logging, multiple transports, JSON support
- **Usage**: Replace console.log with structured logging

```bash
npm install winston
```

### 2. **Metrics: Prometheus + prom-client** (Industry Standard)
- **Package**: `prom-client`
- **Why**: Industry standard, works with Grafana, exposes HTTP endpoint
- **Usage**: Track game metrics (active rooms, players, WebSocket connections)

```bash
npm install prom-client
```

### 3. **Error Tracking: Sentry** (Most Popular)
- **Package**: `@sentry/node` (backend) + `@sentry/react` (frontend)
- **Why**: Real-time error tracking, performance monitoring, release tracking
- **Usage**: Track errors in production, monitor performance

```bash
npm install @sentry/node @sentry/react
```

### 4. **Distributed Tracing: OpenTelemetry** (Modern Standard)
- **Package**: `@opentelemetry/api`, `@opentelemetry/sdk-node`
- **Why**: Open standard, works with many backends (Jaeger, Zipkin, etc.)
- **Usage**: Track requests across Express routes and WebSocket messages

```bash
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express @opentelemetry/instrumentation-ws
```

### 5. **Frontend Analytics: PostHog** (Open Source Alternative)
- **Package**: `posthog-js`
- **Why**: Open source, privacy-friendly, feature flags, session replay
- **Usage**: Track user behavior, game events, A/B testing

```bash
npm install posthog-js
```

## Quick Start Implementation

### Step 1: Winston Logging (Backend)

```typescript
// server/lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Add file transport for production
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Step 2: Prometheus Metrics (Backend)

```typescript
// server/lib/metrics.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export const register = new Registry();

// Game metrics
export const activeRooms = new Gauge({
  name: 'game_active_rooms',
  help: 'Number of active game rooms',
  registers: [register]
});

export const activePlayers = new Gauge({
  name: 'game_active_players',
  help: 'Number of active players',
  registers: [register]
});

export const websocketConnections = new Gauge({
  name: 'websocket_connections',
  help: 'Number of active WebSocket connections',
  registers: [register]
});

export const gameEnded = new Counter({
  name: 'game_ended_total',
  help: 'Total number of games ended',
  registers: [register]
});

export const itemCollected = new Counter({
  name: 'item_collected_total',
  help: 'Total number of items collected',
  labelNames: ['correct'],
  registers: [register]
});

export const requestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});
```

### Step 3: Sentry Error Tracking

```typescript
// server/lib/sentry.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
```

### Step 4: Add Metrics Endpoint

```typescript
// server/routes.ts - Add this route
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

## Alternative Libraries

### Logging Alternatives:
- **Pino** - Faster than Winston, better for high-throughput
- **Bunyan** - JSON logging, less popular now

### Metrics Alternatives:
- **StatsD** - Simple UDP-based metrics (requires backend like Datadog)
- **New Relic** - Commercial APM solution
- **Datadog** - Commercial observability platform

### Error Tracking Alternatives:
- **Rollbar** - Similar to Sentry, good for Node.js
- **Bugsnag** - Good for mobile + web
- **LogRocket** - Session replay + error tracking

## Recommended Stack for This Project

**Minimal Setup:**
1. Winston (logging)
2. prom-client (metrics)
3. Sentry (errors)

**Full Observability:**
1. Winston (logging)
2. prom-client + Grafana (metrics visualization)
3. Sentry (errors + performance)
4. OpenTelemetry + Jaeger (distributed tracing)
5. PostHog (frontend analytics)

## Game-Specific Metrics to Track

- Active rooms count
- Active players count
- WebSocket connections
- Games started/ended
- Items collected (correct/incorrect)
- Average game duration
- Player accuracy rates
- Room creation/join rates
- WebSocket message latency
- API endpoint response times

