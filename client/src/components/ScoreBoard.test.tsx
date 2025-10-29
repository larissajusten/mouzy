import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBoard } from './ScoreBoard';
import { Player } from '@shared/schema';

describe('ScoreBoard', () => {
  const players: Player[] = [
    {
      id: '1',
      name: 'Player One',
      color: '#EF4444',
      score: 100,
      position: { x: 0, y: 0 },
      itemsCollected: 20,
      correctAttempts: 18,
      totalAttempts: 20,
    },
    {
      id: '2',
      name: 'Player Two',
      color: '#3B82F6',
      score: 50,
      position: { x: 0, y: 0 },
      itemsCollected: 10,
      correctAttempts: 9,
      totalAttempts: 10,
    },
  ];

  it('renders all players', () => {
    render(<ScoreBoard players={players} />);
    expect(screen.getByText('Player One')).toBeInTheDocument();
    expect(screen.getByText('Player Two')).toBeInTheDocument();
  });

  it('sorts players by score (highest first)', () => {
    render(<ScoreBoard players={players} />);
    const ranks = screen.getAllByTestId(/text-rank-/);
    expect(ranks[0]).toHaveTextContent('1º');
    expect(ranks[1]).toHaveTextContent('2º');
  });

  it('displays correct scores', () => {
    render(<ScoreBoard players={players} />);
    expect(screen.getByTestId('text-current-score-1')).toHaveTextContent('100');
    expect(screen.getByTestId('text-current-score-2')).toHaveTextContent('50');
  });

  it('displays items collected', () => {
    render(<ScoreBoard players={players} />);
    expect(screen.getByTestId('text-items-1')).toHaveTextContent('20 itens');
    expect(screen.getByTestId('text-items-2')).toHaveTextContent('10 itens');
  });

  it('highlights current player', () => {
    const { container } = render(<ScoreBoard players={players} currentPlayerId="2" />);
    const player2Element = container.querySelector('[data-testid="score-player-2"]');
    expect(player2Element).toHaveClass('bg-primary/10', 'border-primary');
  });

  it('shows correct player colors', () => {
    render(<ScoreBoard players={players} />);
    const color1 = screen.getByTestId('color-indicator-1');
    const color2 = screen.getByTestId('color-indicator-2');
    
    expect(color1).toHaveStyle({ backgroundColor: '#EF4444' });
    expect(color2).toHaveStyle({ backgroundColor: '#3B82F6' });
  });

  it('renders with empty player list', () => {
    render(<ScoreBoard players={[]} />);
    expect(screen.getByText('Placar')).toBeInTheDocument();
  });
});
