import type { Meta, StoryObj } from '@storybook/react';
import { GameTimer } from './GameTimer';

const meta: Meta<typeof GameTimer> = {
  title: 'Game/GameTimer',
  component: GameTimer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GameTimer>;

export const OneMinute: Story = {
  args: {
    timeRemaining: 60,
  },
};

export const ThirtySeconds: Story = {
  args: {
    timeRemaining: 30,
  },
};

export const WarningState: Story = {
  args: {
    timeRemaining: 9,
  },
};

export const LastSecond: Story = {
  args: {
    timeRemaining: 1,
  },
};

export const NoTimer: Story = {
  args: {
    timeRemaining: null,
  },
};

export const TwoMinutes: Story = {
  args: {
    timeRemaining: 120,
  },
};

export const FiveMinutes: Story = {
  args: {
    timeRemaining: 300,
  },
};
