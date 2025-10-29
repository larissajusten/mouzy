import type { Meta, StoryObj } from '@storybook/react';
import { FloatingScore } from './FloatingScore';

const meta: Meta<typeof FloatingScore> = {
  title: 'Game/FloatingScore',
  component: FloatingScore,
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
type Story = StoryObj<typeof FloatingScore>;

export const SuccessSmallPoints: Story = {
  args: {
    points: 1,
    position: { x: 200, y: 150 },
    success: true,
    onComplete: () => console.log('Animation completed'),
  },
};

export const SuccessMediumPoints: Story = {
  args: {
    points: 3,
    position: { x: 200, y: 150 },
    success: true,
    onComplete: () => console.log('Animation completed'),
  },
};

export const SuccessHighPoints: Story = {
  args: {
    points: 10,
    position: { x: 200, y: 150 },
    success: true,
    onComplete: () => console.log('Animation completed'),
  },
};

export const Error: Story = {
  args: {
    points: 0,
    position: { x: 200, y: 150 },
    success: false,
    onComplete: () => console.log('Animation completed'),
  },
};

export const MultipleScores: Story = {
  render: () => (
    <div style={{ width: '400px', height: '300px', position: 'relative' }}>
      <FloatingScore
        points={1}
        position={{ x: 100, y: 100 }}
        success={true}
        onComplete={() => {}}
      />
      <FloatingScore
        points={3}
        position={{ x: 200, y: 150 }}
        success={true}
        onComplete={() => {}}
      />
      <FloatingScore
        points={0}
        position={{ x: 300, y: 200 }}
        success={false}
        onComplete={() => {}}
      />
    </div>
  ),
};
