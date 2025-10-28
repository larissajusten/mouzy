# Ratinho Caça-Letras

## Visão Geral
Jogo educativo multiplayer em tempo real onde crianças controlam um ratinho com o mouse para coletar itens (queijos, frutas) e aprender letras. Cada item coletável requer que o jogador pressione a(s) tecla(s) correspondente(s) exibidas na tela.

## Propósito
Ensinar alfabetização de forma divertida e interativa através de um jogo competitivo multiplayer que progressivamente aumenta a dificuldade (vogais → consoantes → maiúsculas → símbolos).

## Estado Atual
### Fase 1 Completa - Schema & Frontend
- ✅ Schema de dados definido para salas, jogadores, itens e estado do jogo
- ✅ Imagens geradas (ratinho mascote, queijos, maçã, pão)
- ✅ Design system configurado com fonte Fredoka e cores vibrantes
- ✅ Todos os componentes React criados:
  - Tela inicial com entrada de nome do jogador
  - Criação de sala com configurações (tempo, dificuldade)
  - Entrada em sala existente via código
  - Lobby de espera com lista de jogadores
  - Arena de jogo com ratinhos movendo-se e itens coletáveis
  - Sistema de pontuação ao vivo
  - Cronômetro visual
  - Tela de ranking final com pódio

### Próximas Etapas
- Backend com WebSocket para sincronização multiplayer
- Integração frontend-backend
- Testes end-to-end

## Arquitetura do Projeto

### Frontend (React + TypeScript)
**Páginas:**
- `/` - Home: Nome do jogador + botões Criar/Entrar
- `/create` - Configuração de nova sala
- `/join` - Entrada em sala existente
- `/lobby/:code` - Sala de espera
- `/game/:code` - Arena de jogo principal
- `/results/:code` - Ranking final

**Componentes Principais:**
- `MouseCursor` - Ratinho seguindo cursor do mouse
- `CollectibleItemComponent` - Itens (queijos, frutas) na arena
- `LetterPrompt` - Modal mostrando letra/tecla a pressionar
- `ScoreBoard` - Placar lateral com pontuações ao vivo
- `GameTimer` - Cronômetro regressivo
- `FloatingScore` - Feedback visual de pontos ganhos

### Backend (Express + WebSocket)
**Storage (In-Memory):**
- Gerenciamento de salas ativas
- Estado dos jogadores
- Itens coletáveis por sala
- Sincronização em tempo real

**WebSocket Events:**
- `join-room` - Jogador entra na sala
- `player-move` - Atualização de posição do ratinho
- `collect-item` - Tentativa de coletar item
- `start-game` - Início da partida
- `game-ended` - Fim do jogo

### Schema de Dados
```typescript
GameRoom {
  code: string (6 chars)
  hostId: string
  players: Player[]
  items: CollectibleItem[]
  gameState: 'waiting' | 'playing' | 'finished'
  timerDuration: number | null
  timeRemaining: number | null
  difficulty: 1-4
}

Player {
  id: string
  name: string
  color: string (8 cores pré-definidas)
  score: number
  position: {x, y}
  itemsCollected: number
  correctAttempts: number
}

CollectibleItem {
  id: string
  type: 'cheese-small' | 'cheese-medium' | 'apple' | 'bread'
  position: {x, y}
  letter: string
  difficultyLevel: 1-4
  points: number
  requiresShift: boolean
}
```

## Mecânicas do Jogo

### Níveis de Dificuldade
1. **Vogais** (1 ponto): a, e, i, o, u
2. **Consoantes** (2 pontos): b, c, d, f, g, etc.
3. **Maiúsculas** (3 pontos): Shift + letra
4. **Símbolos** (5 pontos): Shift + número/pontuação

### Pontuação por Item
- Queijo pequeno: 1-2 pontos
- Queijo médio: 3 pontos
- Maçã/Pão: 5 pontos

### Fluxo do Jogo
1. Jogador entra com nome → cria/entra em sala
2. Host configura tempo e dificuldade
3. Aguarda outros jogadores no lobby
4. Host inicia jogo
5. Itens aparecem aleatoriamente na arena
6. Jogador move ratinho sobre item → letra aparece
7. Pressiona tecla correta → ganha pontos + feedback visual
8. Jogo termina quando tempo acaba
9. Tela de resultados mostra pódio e estatísticas

## Design System

### Cores
- Primary: Purple vibrant (#A855F7)
- Background: Gradientes suaves de primary/accent
- Player Colors: 8 cores distintas para identificação

### Tipografia
- Primary: Fredoka (700-800 para títulos, 500-600 para UI)
- Secondary: Inter (para textos menores)

### Princípios
- Botões grandes e legíveis para crianças
- Feedback visual imediato
- Animações suaves e alegres
- Alto contraste para acessibilidade
- Ícones grandes do Lucide React

## Dependências Principais
- React + TypeScript
- Wouter (routing)
- TanStack Query (state management)
- WebSocket (ws) para multiplayer
- Shadcn UI (componentes)
- Lucide React (ícones)
- Tailwind CSS (estilização)

## Configuração
- Servidor Vite na porta 5000
- WebSocket path: `/ws`
- Express backend integrado
