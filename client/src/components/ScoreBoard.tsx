import { Player } from '@shared/schema';
import { Trophy, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ScoreBoardProps {
  players: Player[];
  currentPlayerId?: string;
}

export function ScoreBoard({ players, currentPlayerId }: ScoreBoardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card className="p-4 h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Placar</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            data-testid={`score-player-${player.id}`}
            className={`p-3 rounded-lg border-2 transition-all ${
              player.id === currentPlayerId
                ? 'bg-primary/10 border-primary'
                : 'bg-card border-card-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <div data-testid={`text-rank-${player.id}`} className="flex-shrink-0 text-lg font-bold text-muted-foreground w-6">
                {index + 1}º
              </div>
              <div
                data-testid={`color-indicator-${player.id}`}
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: player.color }}
              />
              <div className="flex-1 min-w-0">
                <div data-testid={`text-player-name-score-${player.id}`} className="font-semibold text-sm truncate">
                  {player.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Target className="w-3 h-3" />
                  <span data-testid={`text-items-${player.id}`}>{player.itemsCollected} itens</span>
                </div>
              </div>
              <div data-testid={`text-current-score-${player.id}`} className="text-2xl font-bold text-primary">
                {player.score}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
