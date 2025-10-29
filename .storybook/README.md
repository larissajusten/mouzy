# Storybook - Ratinho Caça-Letras

Este projeto usa Storybook para desenvolver e testar componentes React de forma isolada.

## Como Rodar

Para iniciar o Storybook em modo desenvolvimento:

```bash
npx storybook dev -p 6006
```

O Storybook ficará disponível em: `http://localhost:6006`

## Como Construir (Build)

Para gerar a versão estática do Storybook:

```bash
npx storybook build
```

Os arquivos serão gerados na pasta `storybook-static/`

## Componentes Documentados

### UI Components (Shadcn)
- **Button** - Todos os tamanhos e variantes (default, destructive, outline, secondary, ghost)
- **Card** - Layouts variados incluindo cards específicos do jogo
- **Badge** - Todas as variantes incluindo badges de conquistas

### Game Components
- **MouseCursor** - Cursor do ratinho em diferentes cores e com/sem nome
- **CollectibleItemComponent** - Itens coletáveis (queijos, maçã, pão) com estados hover
- **ScoreBoard** - Placar com diferentes quantidades de jogadores
- **LetterPrompt** - Modal mostrando letras, símbolos e combinações com Shift
- **FloatingScore** - Feedback visual de pontos (+1, +3, etc) e erros
- **GameTimer** - Cronômetro com estados normais e de aviso (últimos 10s)

## Backgrounds Disponíveis

- **light** - Fundo branco padrão
- **dark** - Fundo escuro (#0a0a0a)
- **game-bg** - Gradiente do jogo (purple/accent)

## Estrutura

```
.storybook/
  ├── main.ts          # Configuração principal do Storybook
  ├── preview.ts       # Configuração de visualização e backgrounds
  └── README.md        # Este arquivo

client/src/
  ├── components/
  │   ├── ui/
  │   │   ├── button.stories.tsx
  │   │   ├── card.stories.tsx
  │   │   └── badge.stories.tsx
  │   ├── MouseCursor.stories.tsx
  │   ├── CollectibleItemComponent.stories.tsx
  │   ├── ScoreBoard.stories.tsx
  │   ├── LetterPrompt.stories.tsx
  │   ├── FloatingScore.stories.tsx
  │   └── GameTimer.stories.tsx
```

## Aliases Configurados

- `@/` → `client/src/`
- `@assets/` → `attached_assets/`
- `@shared/` → `shared/`

Estes aliases permitem importar componentes e recursos usando caminhos absolutos, igual ao projeto principal.
