import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Target, Clock, Home } from 'lucide-react';
import { PlayerStats } from '@shared/schema';
import { useAchievements } from '@/hooks/use-achievements';
import { AchievementToast } from '@/components/AchievementToast';

export default function Results() {
  const [, params] = useRoute('/results/:code');
  const [location, setLocation] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const playerId = queryParams.get('playerId');
  const roomCode = params?.code || '';

  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [gameProcessed, setGameProcessed] = useState(false);
  const [roomDifficulty, setRoomDifficulty] = useState<number | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<string[]>([]);

  const currentPlayerStats = stats.find(s => s.player.id === playerId);
  const playerName = currentPlayerStats?.player.name || null;
  
  const { newAchievements, updateProgress, clearNewAchievements } = useAchievements(playerId, playerName);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'get-results', roomCode }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'game-ended') {
        setStats(message.stats);
      } else if (message.type === 'room-state') {
        setRoomDifficulty(message.room.difficulty);
        setRoomPlayers(message.room.players.map((p: any) => p.id).filter((id: string) => id !== playerId));
        
        const finalStats = message.room.players.map((player: any, index: number) => ({
          position: index + 1,
          player,
          accuracy: player.totalAttempts > 0 ? (player.correctAttempts / player.totalAttempts) * 100 : 0,
          timeElapsed: 0,
        })).sort((a: any, b: any) => b.player.score - a.player.score);
        
        setStats(finalStats);
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [roomCode, playerId]);

  useEffect(() => {
    if (currentPlayerStats && !gameProcessed && playerId && roomDifficulty !== null) {
      const storedRooms = localStorage.getItem('ratinho-processed-rooms') || '[]';
      const processedRooms = JSON.parse(storedRooms);
      
      if (!processedRooms.includes(roomCode)) {
        const matchAccuracy = currentPlayerStats.accuracy;
        const matchScore = currentPlayerStats.player.score;
        
        updateProgress({
          itemsCollected: currentPlayerStats.player.itemsCollected,
          correctAttempts: currentPlayerStats.player.correctAttempts,
          totalAttempts: currentPlayerStats.player.totalAttempts,
          score: matchScore,
          difficulty: roomDifficulty,
          gameCompleted: true,
          opponents: roomPlayers,
          matchAccuracy,
          matchScore,
        });

        processedRooms.push(roomCode);
        localStorage.setItem('ratinho-processed-rooms', JSON.stringify(processedRooms));
        setGameProcessed(true);
      }
    }
  }, [currentPlayerStats, gameProcessed, roomCode, playerId, roomDifficulty, roomPlayers, updateProgress]);

  const topThree = stats.slice(0, 3);

  const getPodiumHeight = (position: number) => {
    if (position === 1) return 'h-40';
    if (position === 2) return 'h-32';
    return 'h-24';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-6">
        <Card className="p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 data-testid="text-game-over" className="text-4xl font-bold mb-2">Fim de Jogo!</h1>
            <p data-testid="text-player-position" className="text-xl text-muted-foreground">
              Você ficou em {currentPlayerStats?.position}º lugar
            </p>
          </div>

          <div className="flex justify-center items-end gap-4 mb-8">
            {topThree.map((stat, index) => {
              const actualPosition = stat.position;
              const displayOrder = actualPosition === 1 ? 1 : actualPosition === 2 ? 0 : 2;
              
              return (
                <div
                  key={stat.player.id}
                  data-testid={`podium-position-${actualPosition}`}
                  className="flex flex-col items-center"
                  style={{ order: displayOrder }}
                >
                  <div
                    data-testid={`icon-trophy-${actualPosition}`}
                    className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 ${
                      actualPosition === 1 ? 'bg-yellow-400 text-yellow-900 animate-bounce' :
                      actualPosition === 2 ? 'bg-gray-300 text-gray-700' :
                      'bg-orange-400 text-orange-900'
                    }`}
                    style={{
                      border: `4px solid ${stat.player.color}`,
                    }}
                  >
                    <Trophy className="w-12 h-12" />
                  </div>
                  
                  <div
                    className={`${getPodiumHeight(actualPosition)} w-32 rounded-t-lg flex flex-col items-center justify-center p-4 transition-all`}
                    style={{
                      backgroundColor: stat.player.color,
                    }}
                  >
                    <div data-testid={`text-podium-rank-${actualPosition}`} className="text-3xl font-bold text-white mb-1">
                      {actualPosition}º
                    </div>
                    <div data-testid={`text-podium-name-${actualPosition}`} className="text-white font-semibold text-center text-sm mb-2">
                      {stat.player.name}
                    </div>
                    <div data-testid={`text-podium-score-${actualPosition}`} className="text-2xl font-bold text-white">
                      {stat.player.score}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Card className="p-6 bg-card/50">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Ranking Completo
            </h3>
            <div className="space-y-2">
              {stats.map((stat) => (
                <div
                  key={stat.player.id}
                  data-testid={`result-player-${stat.player.id}`}
                  className={`p-4 rounded-lg border-2 flex items-center gap-4 ${
                    stat.player.id === playerId
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-card-border'
                  }`}
                >
                  <div data-testid={`text-position-${stat.player.id}`} className="text-2xl font-bold text-muted-foreground w-8">
                    {stat.position}º
                  </div>
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: stat.player.color }}
                  />
                  <div className="flex-1">
                    <div data-testid={`text-name-${stat.player.id}`} className="font-bold">{stat.player.name}</div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span data-testid={`text-items-collected-${stat.player.id}`} className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {stat.player.itemsCollected} itens
                      </span>
                      <span data-testid={`text-accuracy-${stat.player.id}`} className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {stat.accuracy.toFixed(0)}% acertos
                      </span>
                    </div>
                  </div>
                  <div data-testid={`text-score-${stat.player.id}`} className="text-3xl font-bold text-primary">
                    {stat.player.score}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Card>

        <div className="flex gap-4">
          <Button
            data-testid="button-home"
            onClick={() => setLocation(`/?playerId=${playerId}`)}
            className="flex-1 h-14 text-lg font-bold gap-2"
            size="lg"
          >
            <Home className="w-5 h-5" />
            Voltar ao Menu
          </Button>
        </div>
      </div>

      <AchievementToast
        achievements={newAchievements}
        onDismiss={clearNewAchievements}
      />
    </div>
  );
}
