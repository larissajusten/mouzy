import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface FloatingScoreProps {
  points: number;
  position: { x: number; y: number };
  success: boolean;
  onComplete: () => void;
}

export function FloatingScore({ points, position, success, onComplete }: FloatingScoreProps) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0);
      setTimeout(onComplete, 300);
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      data-testid="floating-score"
      className="absolute pointer-events-none z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        opacity,
        transition: 'all 1s ease-out',
      }}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xl shadow-lg ${
          success
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}
      >
        {success ? (
          <CheckCircle data-testid="icon-success" className="w-5 h-5" />
        ) : (
          <XCircle data-testid="icon-error" className="w-5 h-5" />
        )}
        <span data-testid="text-feedback">{success ? `+${points}` : 'Ops!'}</span>
      </div>
    </div>
  );
}
