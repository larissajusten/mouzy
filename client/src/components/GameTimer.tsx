import { Clock, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GameTimerProps {
  timeRemaining: number | null;
}

export function GameTimer({ timeRemaining }: GameTimerProps) {
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining <= 10) {
      setIsWarning(true);
    } else {
      setIsWarning(false);
    }
  }, [timeRemaining]);

  if (timeRemaining === null) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      data-testid="game-timer"
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-2xl transition-all ${
        isWarning
          ? 'bg-destructive text-destructive-foreground animate-pulse shadow-lg'
          : 'bg-card text-card-foreground border-2 border-card-border'
      }`}
    >
      {isWarning ? (
        <AlertCircle className="w-6 h-6" />
      ) : (
        <Clock className="w-6 h-6" />
      )}
      <span data-testid="text-time" className="tabular-nums">{timeString}</span>
    </div>
  );
}
