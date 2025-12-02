# Sentry Setup Guide

Este guia mostra como configurar o Sentry para rastreamento de erros e performance monitoring.

## 📋 Pré-requisitos

1. Conta no Sentry (https://sentry.io)
2. Projeto criado no Sentry (um para backend, outro para frontend)

## 🚀 Configuração Rápida

### 1. Criar Projetos no Sentry

#### Backend (Node.js)
1. Acesse https://sentry.io
2. Vá em **Projects** → **Create Project**
3. Selecione **Node.js**
4. Copie o **DSN** fornecido

#### Frontend (React)
1. Crie outro projeto
2. Selecione **React**
3. Copie o **DSN** fornecido

### 2. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```bash
# Backend Sentry DSN
SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id

# Frontend Sentry DSN
VITE_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id

# App Version (opcional, para release tracking)
VITE_APP_VERSION=1.0.0
```

### 3. Reiniciar o Servidor

```bash
npm run dev
```

Você deve ver no console:
```
Sentry initialized successfully
```

## 📊 O que o Sentry Captura

### Backend
- ✅ Erros não tratados (uncaught exceptions)
- ✅ Rejeições de promises não tratadas
- ✅ Erros em rotas Express
- ✅ Erros em handlers WebSocket
- ✅ Performance de requisições HTTP
- ✅ Stack traces completos
- ✅ Contexto da requisição (body, query, headers)

### Frontend
- ✅ Erros do React (componentDidCatch)
- ✅ Erros de JavaScript não tratados
- ✅ Performance de páginas
- ✅ Session Replay (gravação de sessões com erros)
- ✅ Breadcrumbs (ações do usuário antes do erro)

## 🔍 Ver Erros no Sentry

1. Acesse https://sentry.io
2. Selecione seu projeto
3. Vá em **Issues** para ver todos os erros
4. Clique em um erro para ver:
   - Stack trace completo
   - Contexto da requisição
   - Breadcrumbs (ações antes do erro)
   - Performance data
   - Session replay (frontend)

## 🎯 Recursos Avançados

### Adicionar Contexto Customizado

```typescript
// Backend
import { Sentry } from './lib/sentry';

Sentry.setUser({
  id: playerId,
  username: playerName,
});

Sentry.setTag('roomCode', roomCode);
Sentry.setContext('game', {
  difficulty: roomDifficulty,
  players: roomPlayers.length,
});
```

```typescript
// Frontend
import { Sentry } from './lib/sentry';

Sentry.setUser({
  id: playerId,
  email: userEmail,
});

Sentry.setTag('page', 'game');
```

### Capturar Erros Manualmente

```typescript
// Backend
import { Sentry } from './lib/sentry';

try {
  // código que pode falhar
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      customTag: 'value',
    },
    extra: {
      customData: 'value',
    }
  });
  throw error;
}
```

```typescript
// Frontend
import { Sentry } from './lib/sentry';

try {
  // código que pode falhar
} catch (error) {
  Sentry.captureException(error);
  // ou
  Sentry.captureMessage('Something went wrong', 'error');
}
```

### Performance Monitoring

O Sentry já está configurado para monitorar:
- Duração de requisições HTTP (backend)
- Tempo de carregamento de páginas (frontend)
- Performance de transações

Veja em **Performance** no dashboard do Sentry.

## 📈 Planos e Limites

### Plano Gratuito (Developer)
- ✅ 5,000 eventos/mês
- ✅ 1 projeto
- ✅ 7 dias de retenção
- ✅ Performance monitoring
- ✅ Session replay

### Plano Team ($26/mês)
- ✅ 50,000 eventos/mês
- ✅ Projetos ilimitados
- ✅ 90 dias de retenção
- ✅ Alertas customizados
- ✅ Integrações (Slack, email, etc.)

## 🐛 Troubleshooting

### Sentry não está capturando erros

1. Verifique se `SENTRY_DSN` está configurado
2. Verifique os logs do console para "Sentry initialized"
3. Teste com um erro manual:
   ```typescript
   Sentry.captureMessage('Test error', 'info');
   ```

### Muitos eventos (quota excedida)

- Ajuste `tracesSampleRate` para 0.1 ou menor em produção
- Use filtros no `beforeSend` para ignorar eventos não importantes
- Considere upgrade de plano

### Session Replay não funciona

- Verifique se `VITE_SENTRY_DSN` está configurado no frontend
- Session Replay só funciona em produção ou com configuração específica

## 📚 Recursos

- Documentação: https://docs.sentry.io
- Dashboard: https://sentry.io
- Status: https://status.sentry.io

