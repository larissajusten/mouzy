import { useEffect, useState } from 'react';
import { Position } from '@shared/schema';
import mouseImage from '@assets/generated_images/cheerful_mouse_mascot_character.png';

interface MouseCursorProps {
  position: Position;
  color: string;
  playerName?: string;
  isLocal?: boolean;
}

export function MouseCursor({ position, color, playerName, isLocal = false }: MouseCursorProps) {
  const [rotation, setRotation] = useState(0);
  const [prevPosition, setPrevPosition] = useState(position);

  useEffect(() => {
    const dx = position.x - prevPosition.x;
    const dy = position.y - prevPosition.y;
    
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      setRotation(angle);
      setPrevPosition(position);
    }
  }, [position, prevPosition]);

  return (
    <div
      data-testid={`cursor-${playerName || 'player'}`}
      className="absolute pointer-events-none transition-all duration-75 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%)`,
        zIndex: isLocal ? 100 : 50,
      }}
    >
      <div
        className="relative transition-transform duration-200 ease-out"
        style={{
          transform: `rotate(${rotation}deg)`,
          filter: `drop-shadow(0 0 8px ${color}80)`,
        }}
      >
        <img
          src={mouseImage}
          alt={playerName || 'Mouse'}
          className="w-12 h-12"
          style={{
            filter: `hue-rotate(${getHueRotation(color)}deg) saturate(1.2)`,
          }}
        />
      </div>
      {playerName && (
        <div
          data-testid={`text-player-name-${playerName}`}
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap"
          style={{
            backgroundColor: color,
            color: '#fff',
          }}
        >
          {playerName}
        </div>
      )}
    </div>
  );
}

export function getHueRotation(color: string): number {
  const colorMap: Record<string, number> = {
    '#EF4444': 0,
    '#3B82F6': 220,
    '#10B981': 140,
    '#F59E0B': 40,
    '#A855F7': 280,
    '#F97316': 20,
    '#EC4899': 320,
    '#14B8A6': 180,
  };
  return colorMap[color] || 0;
}
