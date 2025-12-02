# Observability Setup Guide

Este projeto agora inclui três ferramentas de observabilidade:

## 📦 Bibliotecas Instaladas

1. **Winston** - Logging estruturado
2. **prom-client** - Métricas Prometheus
3. **Sentry** - Rastreamento de erros e performance

## 🚀 Configuração Rápida

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

**Sentry (Opcional mas recomendado):**
- Crie uma conta em https://sentry.io
- Crie um projeto Node.js e React
- Copie o DSN e adicione ao `.env`:
  ```
  SENTRY_DSN=your-backend-dsn-here
  VITE_SENTRY_DSN=your-frontend-dsn-here
  ```

**Logging:**
```
LOG_LEVEL=info  # ou debug, warn, error
```

### 3. Executar o Projeto

```bash
npm run dev
```

## 📊 Métricas Prometheus

As métricas estão disponíveis em: `http://localhost:5001/metrics`

### Métricas Disponíveis

- `game_active_rooms` - Número de salas ativas
- `game_active_players` - Número de jogadores ativos
- `websocket_connections` - Conexões WebSocket ativas
- `game_started_total` - Total de jogos iniciados
- `game_ended_total` - Total de jogos finalizados
- `room_created_total` - Total de salas criadas
- `player_joined_total` - Total de jogadores que entraram
- `item_collected_total` - Total de itens coletados (com label `correct`)
- `websocket_messages_total` - Total de mensagens WebSocket (com label `type`)
- `http_request_duration_seconds` - Duração de requisições HTTP
- `http_requests_total` - Total de requisições HTTP

### Visualizar Métricas com Grafana

1. Instale Prometheus e Grafana
2. Configure Prometheus para coletar de `http://localhost:5001/metrics`
3. Crie dashboards no Grafana

## 📝 Logs

Os logs são escritos no console em desenvolvimento e em arquivos em produção:

- `logs/error.log` - Apenas erros
- `logs/combined.log` - Todos os logs

### Níveis de Log

- `error` - Erros que precisam atenção
- `warn` - Avisos
- `info` - Informações gerais (padrão)
- `debug` - Informações de debug

## 🐛 Sentry

### Backend

Erros do servidor são automaticamente enviados para o Sentry com:
- Stack trace completo
- Contexto da requisição
- Performance tracking

### Frontend

Erros do React são capturados automaticamente com:
- Stack trace do JavaScript
- Session replay (em produção)
- Performance monitoring

### Ver Erros

Acesse https://sentry.io para ver todos os erros em tempo real.

## 🔍 Exemplos de Uso

### Ver Métricas em Tempo Real

```bash
# Métricas em formato Prometheus
curl http://localhost:5001/metrics

# Filtrar apenas métricas de jogo
curl http://localhost:5001/metrics | grep game_
```

### Logs Estruturados

Os logs incluem contexto adicional:
```json
{
  "timestamp": "2024-01-01 12:00:00",
  "level": "info",
  "message": "Game started",
  "roomCode": "ABC123",
  "players": 2,
  "items": 15
}
```

## 📈 Monitoramento Recomendado

### Alertas Prometheus

Configure alertas para:
- `websocket_connections` muito alto (> 1000)
- `http_request_duration_seconds` > 1s
- `game_ended_total` sem incremento por muito tempo

### Dashboards Grafana

Crie dashboards para:
- Taxa de criação de salas
- Jogadores ativos ao longo do tempo
- Taxa de sucesso de coleta de itens
- Latência de mensagens WebSocket

## 🛠️ Troubleshooting

### Métricas não aparecem

- Verifique se o endpoint `/metrics` está acessível
- Verifique os logs do servidor

### Sentry não captura erros

- Verifique se `SENTRY_DSN` está configurado
- Verifique os logs do console para mensagens de inicialização

### Logs não aparecem em arquivos

- Em desenvolvimento, logs vão apenas para o console
- Em produção, verifique se a pasta `logs/` existe e tem permissões de escrita

