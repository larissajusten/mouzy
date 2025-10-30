import { useState, useCallback } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Users, Play, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GameRoom, WebSocketMessage } from '@shared/schema';
import { useWebSocket } from '@/hooks/use-websocket';

export default function Lobby() {
  const [, params] = useRoute('/lobby/:code');
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(window.location.search);
  const playerId = queryParams.get('playerId');
  const roomCode = params?.code || '';

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [copied, setCopied] = useState(false);

  const isHost = room?.hostId === playerId;

  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'room-state') {
      setRoom(message.room);
      
      if (message.room.gameState === 'playing') {
        setLocation(`/game/${roomCode}?playerId=${playerId}`);
      }
    } else if (message.type === 'player-left') {
      // Atualizar UI removendo o jogador que saiu
      setRoom(prevRoom => {
        if (!prevRoom) return prevRoom;
        return {
          ...prevRoom,
          players: prevRoom.players.filter(p => p.id !== message.playerId)
        };
      });
    }
  }, [roomCode, playerId, setLocation]);

  const handleError = useCallback(() => {
    toast({
      title: 'Erro de conexão',
      description: 'Não foi possível conectar ao servidor.',
      variant: 'destructive',
    });
  }, [toast]);

  const { sendMessage } = useWebSocket({
    roomCode,
    playerId,
    onMessage: handleMessage,
    onError: handleError,
  });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast({
        title: 'Código copiado!',
        description: 'Compartilhe com seus amigos.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o código.',
        variant: 'destructive',
      });
    }
  };

  const handleStartGame = () => {
    sendMessage({ type: 'start-game', roomCode });
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium">Carregando sala...</p>
          </div>
        </Card>
      </div>
    );
  }

  const timerText = room.timerDuration
    ? `${Math.floor(room.timerDuration / 60)} minuto${room.timerDuration >= 120 ? 's' : ''}`
    : 'Sem limite';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full p-8 space-y-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              data-testid="button-back"
              variant="outline"
              size="icon"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 data-testid="text-page-title" className="text-3xl font-bold">Sala de Espera</h1>
              <p data-testid="text-page-subtitle" className="text-muted-foreground">Aguardando jogadores...</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="p-6 bg-primary/5 border-2 border-primary">
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">
                  Código da Sala
                </div>
                <div className="flex items-center gap-2">
                  <div data-testid="text-room-code" className="flex-1 text-4xl font-bold tracking-widest text-primary">
                    {roomCode}
                  </div>
                  <Button
                    data-testid="button-copy-code"
                    onClick={handleCopyCode}
                    size="icon"
                    variant="outline"
                    className="h-12 w-12"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">
                  Configurações
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tempo:</span>
                    <span data-testid="text-timer-config" className="font-semibold">{timerText}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Nível:</span>
                    <span data-testid="text-difficulty-config" className="font-semibold">
                      {room.difficulty === 1 && 'Vogais'}
                      {room.difficulty === 2 && 'Consoantes'}
                      {room.difficulty === 3 && 'Maiúsculas'}
                      {room.difficulty === 4 && 'Símbolos'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">
                  Jogadores ({room.players.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {room.players.map((player) => (
                  <div
                    key={player.id}
                    data-testid={`player-${player.id}`}
                    className="flex items-center gap-3 p-3 bg-card rounded-lg border border-card-border"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: player.color }}
                    />
                    <span data-testid={`text-player-name-${player.id}`} className="font-medium">{player.name}</span>
                    {player.id === room.hostId && (
                      <span data-testid="badge-host" className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-semibold">
                        Host
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {isHost && (
          <Button
            data-testid="button-start-game"
            onClick={handleStartGame}
            disabled={room.players.length < 1}
            className="w-full h-14 text-lg font-bold gap-2"
            size="lg"
          >
            <Play className="w-5 h-5" />
            Iniciar Jogo
          </Button>
        )}

        {!isHost && (
          <div className="text-center py-4 text-muted-foreground">
            Aguardando o host iniciar o jogo...
          </div>
        )}
      </Card>
    </div>
  );
}
