# Design Guidelines: Ratinho Caça-Letras

## Design Approach

**Reference-Based Approach** drawing inspiration from successful educational games and child-friendly applications (Duolingo, ABCmouse, Kahoot) combined with playful game aesthetics. The design prioritizes **visual clarity, immediate feedback, and joyful interactions** to create an engaging learning environment for children.

---

## Core Design Principles

1. **Child-First Design**: Large, obvious interactive elements with generous touch/click areas
2. **Instant Feedback**: Every action receives immediate visual and contextual response
3. **Playful Simplicity**: Clean layouts with whimsical character and vibrant visual energy
4. **Competitive Joy**: Multiplayer elements celebrate participation, not just winning

---

## Typography

**Primary Font**: Fredoka (Google Fonts) - rounded, friendly, highly legible for children
- Game Title/Headers: 800 weight, 3xl-5xl sizes
- UI Labels/Buttons: 600 weight, lg-xl sizes  
- Body Text/Instructions: 500 weight, base-lg sizes
- Scores/Numbers: 700 weight, 2xl-4xl sizes

**Secondary Font**: Inter (Google Fonts) - for smaller UI elements
- Player names, settings: 500 weight, sm-base sizes

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16** for consistent rhythm
- Micro spacing (between related elements): p-2, gap-2
- Component padding: p-4, p-8
- Section spacing: py-12, py-16
- Large separations: mt-16, mb-16

**Responsive Breakpoints**:
- Mobile (base): Single column, stacked UI
- Tablet (md:): Two-column layouts for lobby/settings
- Desktop (lg:): Full game arena with side panels

---

## Screen Layouts

### 1. Welcome Screen
- **Hero Area**: Full-viewport centered content with animated mouse mascot character dancing/moving
- **Title**: Large, bouncy "Ratinho Caça-Letras" with drop shadow and subtle animation
- **Action Zone**: Two large, prominent buttons stacked vertically (md: side-by-side)
  - "Criar Sala" (primary action, larger emphasis)
  - "Entrar em Sala" (secondary styling)
- **Player Name Input**: Above buttons, centered, with playful icon
- **Background**: Illustrated pattern of cheese, letters, and food items with soft parallax effect

### 2. Room Creation/Configuration
- **Two-Column Layout** (stacks on mobile):
  - **Left Column**: Configuration controls
    - Room code display with large, copyable text (bordered box, distinct background)
    - Timer dropdown with icon
    - Difficulty selector (visual cards with examples)
    - Large "Iniciar Jogo" button at bottom
  - **Right Column**: Waiting room
    - "Jogadores Aguardando" header
    - Player cards (avatar/color indicator + name) in vertical list
    - Each card has subtle border and hover state
- **Header**: Back button, room title

### 3. Game Arena
- **Main Game Area** (center, 70% width on desktop):
  - Full-bleed play zone with subtle grid or pattern background
  - Collectible items scattered throughout (cheese, fruits rendered as playful icons/images)
  - Mouse cursors for all players (different colors, smooth animations)
  - Letter prompt overlay when hovering item (large modal-style display, centered, with dramatic scale-in animation)
- **Right Sidebar** (30% width, full-height):
  - "Placar" header with icon
  - Player score cards (stacked, each showing color dot, name, score)
  - Live updating with subtle pulse animation on score changes
- **Top Bar**: 
  - Timer (if enabled) - large, prominent, centered or right-aligned
  - Last 10 seconds: pulsing red animation
  - Exit/Settings icon (left corner)
- **Letter Prompt Overlay**:
  - Semi-transparent dark backdrop
  - Large white card with rounded corners
  - Giant letter display (8xl-9xl font size)
  - Keyboard key visualization showing which key to press
  - For Shift combinations: visual showing two keys with "+" between them

### 4. End Game / Ranking Screen
- **Podium Visualization** (top 60% of screen):
  - Three-tier podium with 1st place center and elevated
  - Player avatars/colors on podium positions with crown for 1st
  - Confetti/celebration animation for top 3
  - Large score numbers beneath each player
- **Full Rankings List** (bottom section):
  - Scrollable list of all players with position numbers
  - Each row: position badge, player name/color, score, items collected
- **Action Buttons** (bottom):
  - "Jogar Novamente" (primary, large)
  - "Voltar ao Menu" (secondary, smaller)
- **Statistics Panel** (optional side panel):
  - Total items collected, accuracy percentage, time played

---

## Component Library

### Buttons
- **Primary (CTA)**: Large rounded buttons (rounded-2xl) with bold text, generous padding (px-8 py-4)
- **Secondary**: Outlined style with same rounding
- **Icon Buttons**: Circular (rounded-full) for settings/close actions
- All buttons: Hover scale effect (scale-105), active state press effect (scale-95)

### Cards
- **Player Cards**: Rounded-xl, border, padding p-4, flex layout with color indicator dot (w-4 h-4 rounded-full)
- **Item Selection Cards** (difficulty): Bordered, rounded-lg, clickable with hover lift effect and selected state with prominent border
- **Score Display**: Large number-focused cards with icon, shadow-lg

### Input Fields
- **Text Inputs**: Large (text-lg), rounded-lg borders, generous padding (px-4 py-3)
- **Dropdowns/Selects**: Custom styled with icons, rounded appearance matching text inputs

### Modals/Overlays
- **Letter Prompt**: Centered modal (max-w-md), rounded-3xl, dramatic shadow-2xl, scale animation on appear
- **Tutorial/Instructions**: Similar styling, can be larger (max-w-2xl)

### Game Elements
- **Collectible Items**: Icon-based or small illustrated images (w-12 h-12 to w-16 h-16) with subtle drop shadow
- **Mouse Cursor/Character**: SVG-based illustration, smooth transform transitions
- **Visual Feedback**: 
  - Correct collection: green checkmark with scale burst animation, +points floating upward
  - Incorrect key: red shake animation, no points
  - Item hover state: subtle pulse and glow effect

---

## Animations

**Use Sparingly but Meaningfully**:
- **Welcome Screen**: Mouse mascot gentle bounce loop
- **Letter Prompt**: Scale-in from 0.8 to 1.0 with elastic easing (200ms)
- **Collection Success**: Item disappears with scale-out + fade, score number floats up and fades (600ms)
- **Score Updates**: Pulse effect on player card (150ms)
- **Countdown Alert**: Pulse animation on timer when under 10 seconds
- **Victory**: Confetti particle effect, podium players subtle bounce
- **Mouse Movement**: Smooth lerp/easing on position updates (60fps target)

---

## Images

### Mascot Character Image
- **Where**: Welcome screen hero, potentially end screen celebration
- **Description**: Cheerful cartoon mouse character with large ears, friendly expression, holding cheese. Rendered in vibrant, child-friendly illustration style with clean lines and bright colors. Full-body character facing slightly toward user.

### Background Patterns
- **Where**: Welcome screen, game arena subtle background
- **Description**: Seamless pattern of tiny cheese wedges, alphabet letters, and simple food icons (apples, bread) in muted/pastel tones to avoid distraction from gameplay.

---

## Accessibility & Child-Friendly Features

- **High Contrast**: Text always legible against backgrounds (WCAG AA minimum)
- **Large Click Targets**: All interactive elements minimum 44x44px
- **Clear Visual Hierarchy**: Size and weight differentiation between primary/secondary actions
- **Keyboard Visualization**: Always show which key to press with visual keyboard representation
- **Error Tolerance**: No harsh penalties for mistakes, gentle red shake instead of error messages
- **Sound Integration**: Sound toggle prominently visible, distinct sounds for each action type (collect, error, timer, victory)
- **Loading States**: Friendly loading animations (mouse running, cheese spinning) instead of spinners
- **Tutorial Overlay**: First-time players see interactive tutorial with arrows pointing to each UI element

---

## Multiplayer Visual Distinctions

- **Player Colors**: Pre-defined palette of 8 distinct, vibrant colors (red, blue, green, yellow, purple, orange, pink, teal)
- **Player Indicators**: Each mouse cursor has colored glow/outline matching player color
- **Score Cards**: Color dot indicator beside each player name in sidebar
- **Victory Celebration**: Winner's color prominently featured in confetti/celebration effects

This design creates a joyful, immediately understandable educational game environment that delights children while supporting literacy development through play.