import type { Meta, StoryObj } from '@storybook/react';
import { LetterPrompt } from './LetterPrompt';
import { CollectibleItem, DifficultyLevel } from '@shared/schema';

const meta: Meta<typeof LetterPrompt> = {
  title: 'Game/LetterPrompt',
  component: LetterPrompt,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LetterPrompt>;

const baseItem: CollectibleItem = {
  id: '1',
  type: 'cheese-small',
  position: { x: 100, y: 100 },
  letter: 'A',
  difficultyLevel: DifficultyLevel.VOGAIS,
  points: 1,
  requiresShift: false,
};

export const SimpleLetter: Story = {
  args: {
    item: { ...baseItem, letter: 'A', points: 1, requiresShift: false },
    onCorrect: () => console.log('Correct!'),
    onIncorrect: () => console.log('Incorrect!'),
  },
};

export const ConsonantLetter: Story = {
  args: {
    item: { ...baseItem, letter: 'B', points: 2, difficultyLevel: DifficultyLevel.CONSOANTES, requiresShift: false },
    onCorrect: () => console.log('Correct!'),
    onIncorrect: () => console.log('Incorrect!'),
  },
};

export const UppercaseLetter: Story = {
  args: {
    item: { ...baseItem, letter: 'Q', points: 3, difficultyLevel: DifficultyLevel.MAIUSCULAS, requiresShift: true },
    onCorrect: () => console.log('Correct!'),
    onIncorrect: () => console.log('Incorrect!'),
  },
};

export const Symbol: Story = {
  args: {
    item: { ...baseItem, letter: '@', points: 5, difficultyLevel: DifficultyLevel.SIMBOLOS, requiresShift: true },
    onCorrect: () => console.log('Correct!'),
    onIncorrect: () => console.log('Incorrect!'),
  },
};

export const HighPoints: Story = {
  args: {
    item: { ...baseItem, letter: '#', points: 10, difficultyLevel: DifficultyLevel.SIMBOLOS, requiresShift: true },
    onCorrect: () => console.log('Correct!'),
    onIncorrect: () => console.log('Incorrect!'),
  },
};
