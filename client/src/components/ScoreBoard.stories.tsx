import type { Meta, StoryObj } from '@storybook/react';
import { ScoreBoard } from './ScoreBoard';
import { Player } from '@shared/schema';

const meta: Meta<typeof ScoreBoard> = {
  title: 'Game/ScoreBoard',
  component: ScoreBoard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '300px', height: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ScoreBoard>;

const players: Player[] = [
  {
    id: '1',
    name: 'Ana Silva',
    color: '#EF4444',
    score: 150,
    position: { x: 0, y: 0 },
    itemsCollected: 25,
    correctAttempts: 22,
    totalAttempts: 25,
  },
  {
    id: '2',
    name: 'Bruno Santos',
    color: '#3B82F6',
    score: 120,
    position: { x: 0, y: 0 },
    itemsCollected: 20,
    correctAttempts: 18,
    totalAttempts: 20,
  },
  {
    id: '3',
    name: 'Carla Oliveira',
    color: '#10B981',
    score: 85,
    position: { x: 0, y: 0 },
    itemsCollected: 15,
    correctAttempts: 14,
    totalAttempts: 15,
  },
  {
    id: '4',
    name: 'Daniel Costa',
    color: '#F59E0B',
    score: 60,
    position: { x: 0, y: 0 },
    itemsCollected: 10,
    correctAttempts: 9,
    totalAttempts: 11,
  },
];

export const Default: Story = {
  args: {
    players: players,
  },
};

export const CurrentPlayerHighlighted: Story = {
  args: {
    players: players,
    currentPlayerId: '2',
  },
};

export const TwoPlayers: Story = {
  args: {
    players: players.slice(0, 2),
    currentPlayerId: '1',
  },
};

export const ManyPlayers: Story = {
  args: {
    players: [
      ...players,
      {
        id: '5',
        name: 'Eva Martins',
        color: '#A855F7',
        score: 45,
        position: { x: 0, y: 0 },
        itemsCollected: 8,
        correctAttempts: 7,
        totalAttempts: 9,
      },
      {
        id: '6',
        name: 'Felipe Rocha',
        color: '#F97316',
        score: 30,
        position: { x: 0, y: 0 },
        itemsCollected: 5,
        correctAttempts: 5,
        totalAttempts: 6,
      },
    ],
    currentPlayerId: '3',
  },
};
