import type { Meta, StoryObj } from '@storybook/react';
import { MouseCursor } from './MouseCursor';

const meta: Meta<typeof MouseCursor> = {
  title: 'Game/MouseCursor',
  component: MouseCursor,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'game-bg',
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px', height: '300px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MouseCursor>;

export const RedMouse: Story = {
  args: {
    position: { x: 200, y: 150 },
    color: '#EF4444',
    playerName: 'Jogador 1',
    isLocal: true,
  },
};

export const BlueMouse: Story = {
  args: {
    position: { x: 200, y: 150 },
    color: '#3B82F6',
    playerName: 'Jogador 2',
    isLocal: false,
  },
};

export const GreenMouse: Story = {
  args: {
    position: { x: 200, y: 150 },
    color: '#10B981',
    playerName: 'Jogador 3',
    isLocal: false,
  },
};

export const WithoutName: Story = {
  args: {
    position: { x: 200, y: 150 },
    color: '#F59E0B',
    isLocal: false,
  },
};

export const AllColors: Story = {
  render: () => {
    const colors = [
      { color: '#EF4444', name: 'Vermelho', x: 80 },
      { color: '#3B82F6', name: 'Azul', x: 160 },
      { color: '#10B981', name: 'Verde', x: 240 },
      { color: '#F59E0B', name: 'Amarelo', x: 320 },
    ];

    return (
      <div style={{ width: '400px', height: '300px', position: 'relative' }}>
        {colors.map((item) => (
          <MouseCursor
            key={item.color}
            position={{ x: item.x, y: 150 }}
            color={item.color}
            playerName={item.name}
          />
        ))}
      </div>
    );
  },
};
