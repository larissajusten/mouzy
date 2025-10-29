import type { Meta, StoryObj } from '@storybook/react';
import { CollectibleItemComponent } from './CollectibleItemComponent';
import { CollectibleItem, DifficultyLevel } from '@shared/schema';

const meta: Meta<typeof CollectibleItemComponent> = {
  title: 'Game/CollectibleItem',
  component: CollectibleItemComponent,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'game-bg',
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '200px', height: '200px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CollectibleItemComponent>;

const baseItem: CollectibleItem = {
  id: '1',
  type: 'cheese-small',
  position: { x: 100, y: 100 },
  letter: 'A',
  difficultyLevel: DifficultyLevel.VOGAIS,
  points: 1,
  requiresShift: false,
};

export const CheeseSmall: Story = {
  args: {
    item: { ...baseItem, type: 'cheese-small' },
    isHovered: false,
  },
};

export const CheeseMedium: Story = {
  args: {
    item: { ...baseItem, type: 'cheese-medium' },
    isHovered: false,
  },
};

export const Apple: Story = {
  args: {
    item: { ...baseItem, type: 'apple' },
    isHovered: false,
  },
};

export const Bread: Story = {
  args: {
    item: { ...baseItem, type: 'bread' },
    isHovered: false,
  },
};

export const Hovered: Story = {
  args: {
    item: { ...baseItem, type: 'cheese-medium' },
    isHovered: true,
  },
};

export const AllItems: Story = {
  render: () => {
    const items: CollectibleItem[] = [
      { ...baseItem, id: '1', type: 'cheese-small', position: { x: 50, y: 50 } },
      { ...baseItem, id: '2', type: 'cheese-medium', position: { x: 150, y: 50 } },
      { ...baseItem, id: '3', type: 'apple', position: { x: 50, y: 150 } },
      { ...baseItem, id: '4', type: 'bread', position: { x: 150, y: 150 } },
    ];

    return (
      <div style={{ width: '200px', height: '200px', position: 'relative' }}>
        {items.map((item) => (
          <CollectibleItemComponent key={item.id} item={item} />
        ))}
      </div>
    );
  },
};
