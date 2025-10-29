# Guia de Testes - Ratinho Caça-Letras

## Visão Geral
Este projeto possui uma infraestrutura de testes abrangente com três níveis:
- **Testes Unitários**: Funções puras e lógica de negócio
- **Testes de Componentes**: Componentes React isolados
- **Testes E2E**: Fluxos completos da aplicação

## Ferramentas

### Vitest
Framework de testes unitários e de componentes, escolhido por:
- Compatibilidade nativa com Vite
- Velocidade superior
- API compatível com Jest
- Suporte a TypeScript out-of-the-box

### Testing Library
Biblioteca para testar componentes React, com foco em:
- Testes do ponto de vista do usuário
- Boas práticas de acessibilidade
- Queries semânticas

### Playwright
Framework para testes E2E, oferecendo:
- Testes cross-browser
- Auto-wait inteligente
- Screenshots e traces
- Modo headless e headed

## Estrutura de Arquivos

```
project/
├── client/src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── button.test.tsx          # Testes do componente Button
│   │   ├── MouseCursor.test.tsx         # Testes do componente MouseCursor
│   │   ├── MouseCursor.unit.test.ts     # Testes unitários de helpers
│   │   ├── ScoreBoard.test.tsx          # Testes do componente ScoreBoard
│   │   └── GameTimer.test.tsx           # Testes do componente GameTimer
│   ├── hooks/
│   │   └── use-toast.test.ts            # Testes do reducer de toasts
│   └── lib/
│       └── utils.test.ts                # Testes de utilidades (cn)
├── e2e/
│   ├── game-flow.spec.ts                # Testes de navegação e fluxo
│   ├── multiplayer.spec.ts              # Testes de funcionalidades multiplayer
│   ├── training-mode.spec.ts            # Testes do modo treino
│   └── achievements.spec.ts             # Testes da página de conquistas
├── vitest.config.ts                     # Configuração do Vitest
└── playwright.config.ts                 # Configuração do Playwright
```

## Comandos

### Testes Unitários e de Componentes
```bash
# Rodar todos os testes
npm test

# Modo watch (re-executa ao salvar)
npm test -- --watch

# Com UI interativa
npm test -- --ui

# Coverage report
npm test -- --coverage
```

### Testes E2E
```bash
# Rodar testes E2E
npx playwright test

# Modo UI (interativo)
npx playwright test --ui

# Modo debug
npx playwright test --debug

# Rodar teste específico
npx playwright test e2e/game-flow.spec.ts

# Ver relatório HTML
npx playwright show-report
```

## Cobertura de Testes

### Testes de Componentes
- ✅ **Button**: Variantes, tamanhos, eventos, estados
- ✅ **MouseCursor**: Posicionamento, cores, nome do jogador
- ✅ **ScoreBoard**: Ranking, pontuação, destaque do jogador atual
- ✅ **GameTimer**: Formatação de tempo, estados de alerta

### Testes Unitários
- ✅ **utils (cn)**: Merge de classes CSS, Tailwind
- ✅ **getHueRotation**: Mapeamento de cores para rotação de matiz
- ✅ **toast reducer**: Adicionar, atualizar, remover, dismissar toasts

### Testes E2E
- ✅ **Navegação**: Home → Criar/Entrar → Lobby → Jogo
- ✅ **Multiplayer**: 2 jogadores entrando na mesma sala
- ✅ **Modo Treino**: Início, exibição de elementos, itens
- ✅ **Conquistas**: Visualização, categorias, navegação

## Boas Práticas

### 1. Uso de data-testid
Todos os elementos interativos e informativos possuem `data-testid` seguindo o padrão:
- Interativos: `{action}-{target}` (ex: `button-submit`, `input-email`)
- Exibição: `{type}-{content}` (ex: `text-username`, `status-payment`)
- Dinâmicos: `{type}-{description}-{id}` (ex: `card-product-${id}`)

### 2. Testes Isolados
- Cada teste é independente
- Não dependem de ordem de execução
- Limpeza automática entre testes

### 3. Queries Semânticas
Preferir queries por papel/texto ao invés de classes CSS:
```tsx
// ✅ Bom
screen.getByRole('button', { name: /criar sala/i })
screen.getByTestId('button-create-room')

// ❌ Evitar
container.querySelector('.btn-primary')
```

### 4. User Events
Usar `userEvent` para simular interações reais:
```tsx
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'texto');
```

### 5. Async/Await
Sempre aguardar elementos assíncronos:
```tsx
await expect(page.getByText('Loading...')).toBeVisible();
await expect(page.getByText('Loaded!')).toBeVisible();
```

## Debugging

### Vitest
```bash
# Debug no VSCode
# Adicionar breakpoint e rodar em modo debug

# Logs
console.log(screen.debug()); # Mostra DOM atual
```

### Playwright
```bash
# Screenshots automáticos em falhas
# Traces automáticos em retry
# Playwright Inspector
npx playwright test --debug
```

## CI/CD
Os testes estão configurados para rodar em CI com:
- Retries automáticos (2x)
- Screenshots em falhas
- Traces em retry
- Relatórios HTML

## Melhorias Futuras
- [ ] Testes de snapshot visual
- [ ] Testes de performance
- [ ] Testes de acessibilidade (axe)
- [ ] Coverage mínimo de 80%
- [ ] Testes de integração com WebSocket
