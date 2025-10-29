import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameTimer } from './GameTimer';

describe('GameTimer', () => {
  it('renders time in MM:SS format', () => {
    render(<GameTimer timeRemaining={90} />);
    expect(screen.getByTestId('text-time')).toHaveTextContent('1:30');
  });

  it('pads seconds with leading zero', () => {
    render(<GameTimer timeRemaining={65} />);
    expect(screen.getByTestId('text-time')).toHaveTextContent('1:05');
  });

  it('shows warning state when time <= 10 seconds', () => {
    const { container } = render(<GameTimer timeRemaining={9} />);
    const timer = screen.getByTestId('game-timer');
    expect(timer).toHaveClass('bg-destructive', 'animate-pulse');
  });

  it('shows normal state when time > 10 seconds', () => {
    const { container } = render(<GameTimer timeRemaining={30} />);
    const timer = screen.getByTestId('game-timer');
    expect(timer).toHaveClass('bg-card');
    expect(timer).not.toHaveClass('animate-pulse');
  });

  it('does not render when timeRemaining is null', () => {
    const { container } = render(<GameTimer timeRemaining={null} />);
    expect(container.querySelector('[data-testid="game-timer"]')).not.toBeInTheDocument();
  });

  it('displays 0:00 when time is zero', () => {
    render(<GameTimer timeRemaining={0} />);
    expect(screen.getByTestId('text-time')).toHaveTextContent('0:00');
  });

  it('formats multiple minutes correctly', () => {
    render(<GameTimer timeRemaining={300} />);
    expect(screen.getByTestId('text-time')).toHaveTextContent('5:00');
  });
});
