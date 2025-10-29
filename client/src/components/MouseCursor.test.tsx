import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MouseCursor } from './MouseCursor';

describe('MouseCursor', () => {
  const defaultProps = {
    position: { x: 100, y: 200 },
    color: '#EF4444',
  };

  it('renders at correct position', () => {
    const { container } = render(<MouseCursor {...defaultProps} />);
    const cursor = container.querySelector('[data-testid^="cursor-"]');
    
    expect(cursor).toBeInTheDocument();
    expect(cursor).toHaveStyle({
      left: '100px',
      top: '200px',
    });
  });

  it('displays player name when provided', () => {
    render(<MouseCursor {...defaultProps} playerName="Jogador 1" />);
    expect(screen.getByText('Jogador 1')).toBeInTheDocument();
  });

  it('does not display name when not provided', () => {
    const { container } = render(<MouseCursor {...defaultProps} />);
    const nameElement = container.querySelector('[data-testid^="text-player-name-"]');
    expect(nameElement).not.toBeInTheDocument();
  });

  it('applies correct color to name badge', () => {
    render(<MouseCursor {...defaultProps} playerName="Test" color="#3B82F6" />);
    const nameElement = screen.getByText('Test');
    expect(nameElement).toHaveStyle({ backgroundColor: '#3B82F6' });
  });

  it('has higher z-index for local player', () => {
    const { container } = render(<MouseCursor {...defaultProps} isLocal={true} />);
    const cursor = container.querySelector('[data-testid^="cursor-"]');
    expect(cursor).toHaveStyle({ zIndex: '100' });
  });

  it('has lower z-index for remote players', () => {
    const { container } = render(<MouseCursor {...defaultProps} isLocal={false} />);
    const cursor = container.querySelector('[data-testid^="cursor-"]');
    expect(cursor).toHaveStyle({ zIndex: '50' });
  });
});
