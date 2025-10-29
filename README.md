# Ratinho Caça-Letras (Multiplayer Web Game)

Ratinho Caça-Letras é um jogo web multiplayer em tempo real onde jogadores movem um cursor de rato pelo tabuleiro e coletam itens respondendo à letra solicitada. Inclui lobby, salas, sincronização via WebSocket, placar, timer e tela de resultados.

## Stack
- Client: React 18 + Vite + TypeScript + Tailwind
- Router: `wouter`
- State/Server caching: `@tanstack/react-query`
- WebSocket: `ws` (via servidor Node/Express)
- Server: Express (TypeScript)
- Testes: Vitest + Testing Library (unit), Playwright (E2E)

## Requisitos
- Node.js 20+
- npm 9+

## Instalação
```bash
npm install
```

## Desenvolvimento
Inicia um único servidor Express que também serve o client e o WebSocket na mesma porta.
```bash
npm run dev
```
Acesse: `http://localhost:5001`

Notas:
- O client conecta ao WebSocket na rota `/ws` no mesmo host/porta do app.
- Em dev, Vite roda em middleware no servidor Express.

## Build de produção
```bash
npm run build
npm run start
```
Isso gera o client em `dist/public` e bundle do servidor em `dist`. O servidor em produção serve os assets de `dist/public` e expõe a API e o WebSocket na mesma porta.

## Scripts
- `dev`: inicia servidor Express em modo desenvolvimento (Vite middleware)
- `build`: build do client (Vite) e bundle do servidor (esbuild)
- `start`: inicia servidor em produção a partir de `dist`
- `check`: checa tipos (tsc)
- `db:push`: placeholder do Drizzle (não é necessário para o storage em memória)

## Porta e variáveis de ambiente
- `PORT`: porta HTTP (padrão `5001`). API, client e WebSocket servem na mesma porta.

## Estrutura do projeto
```
/attached_assets           # imagens e assets
/client                    # código do client
  /public
  /src
    /components            # UI e componentes do jogo
    /hooks
    /lib                   # utils, sons, query client
    /pages                 # páginas: Home, Lobby, Game, Results, etc.
    /test                  # setup de testes do client
/server                    # Express + rotas + WebSocket + Vite middleware
/shared                    # tipos e schemas compartilhados (zod)
/e2e                       # testes Playwright
```

## Fluxo do jogo
1. Criar sala: host define tempo e dificuldade.
2. Entrar na sala: jogadores entram via código.
3. Lobby: quando o host inicia, broadcast do estado inicia o jogo.
4. Jogo: cursores dos jogadores se movem; coleta de itens envia mensagens `collect-item` com validação.
5. Timer: ticks por broadcast `timer-update` até finalizar o jogo.
6. Resultados: classificação, estatísticas e conquistas.

Mensagens WebSocket principais:
- `join-room`, `start-game`, `player-move`, `collect-item`, `get-results`
- Broadcasts: `room-state`, `game-started`, `player-moved`, `item-collected`, `timer-update`, `game-ended`, `player-left`

## Testes
### Unit/Component (Vitest)
```bash
npm run test
```
Arquivos de teste em `client/src/**/*.test.ts(x)` e `client/src/test/setup.ts`.

### E2E (Playwright)
```bash
# em um terminal
npm run dev
# em outro terminal
npx playwright test
```
Suites E2E em `e2e/` (fluxo de jogo, multiplayer, achievements, etc.).

## Solução de problemas
- WebSocket não conecta em dev:
  - Garanta que está abrindo `http://localhost:5001` (mesma porta do servidor).
  - Reinicie `npm run dev` e verifique logs: deve aparecer "serving on port 5001" e "WebSocket connected".
- Lobby fica carregando para sempre ao iniciar:
  - O servidor agora possui período de carência para limpeza de salas vazias (30s). Se abrir múltiplas janelas, evite demoras longas ao alternar entre lobby e jogo.
- Cursor local não se move:
  - O cursor local é renderizado pela posição local do mouse dentro da área do jogo. Certifique-se de mover dentro do contêiner do jogo; o cursor padrão do sistema fica oculto (`cursor-none`).

## Convenções de código
- TypeScript estrito em APIs expostas.
- Componentes React funcionais com hooks.
- Evitar efeitos com dependências instáveis que reconectem o WS desnecessariamente.

## Licença
Sugestões comuns:
- MIT: padrão permissivo e simples para projetos web.
- Apache-2.0: similar ao MIT, com cláusula de patentes.

Escolha a licença e atualize este arquivo e `LICENSE` conforme desejado. Assets (imagens/áudio) podem ter licenças diferentes — documente-as separadamente.

## Créditos
- UI baseada em componentes do projeto (Radix + Tailwind)
- WebSocket via `ws`
- Testes E2E via Playwright

---
Sinta-se à vontade para abrir issues e PRs para melhorias, bugs ou novas funcionalidades.
