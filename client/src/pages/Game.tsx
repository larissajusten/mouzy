import { useEffect, useState, useCallback } from 'react';
import { useLocation, useRoute } from 'wouter';
import { GameRoom, CollectibleItem, Position, WebSocketMessage } from '@shared/schema';
import { MouseCursor } from '@/components/MouseCursor';
import { CollectibleItemComponent } from '@/components/CollectibleItemComponent';
import { LetterPrompt } from '@/components/LetterPrompt';
import { ScoreBoard } from '@/components/ScoreBoard';
import { GameTimer } from '@/components/GameTimer';
import { FloatingScore } from '@/components/FloatingScore';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FloatingScoreData {
  id: string;
  points: number;
  position: Position;
  success: boolean;
}

export default function Game() {
  const [, params] = useRoute('/game/:code');
  const [location, setLocation] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const playerId = queryParams.get('playerId');
  const roomCode = params?.code || '';

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState<CollectibleItem | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScoreData[]>([]);

  const currentPlayer = room?.players.find(p => p.id === playerId);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join-room', roomCode, playerId }));
    };

    socket.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      if (message.type === 'room-state') {
        setRoom(message.room);
        
        if (message.room.gameState === 'finished') {
          setLocation(`/results/${roomCode}?playerId=${playerId}`);
        }
      } else if (message.type === 'item-collected') {
        setRoom(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.filter(i => i.id !== message.itemId),
            players: prev.players.map(p =>
              p.id === message.playerId
                ? { ...p, score: message.newScore, itemsCollected: p.itemsCollected + 1 }
                : p
            ),
          };
        });
      } else if (message.type === 'timer-update') {
        setRoom(prev => prev ? { ...prev, timeRemaining: message.timeRemaining } : prev);
      } else if (message.type === 'player-moved') {
        setRoom(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map(p =>
              p.id === message.playerId ? { ...p, position: message.position } : p
            ),
          };
        });
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [roomCode, playerId, setLocation]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = document.getElementById('game-arena');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'player-move',
        roomCode,
        playerId,
        position: { x, y },
      }));
    }

    if (!room) return;

    const hovered = room.items.find(item => {
      const distance = Math.sqrt(
        Math.pow(item.position.x - x, 2) + Math.pow(item.position.y - y, 2)
      );
      return distance < 40;
    });

    setHoveredItem(hovered || null);
  }, [ws, room, roomCode, playerId]);

  useEffect(() => {
    const container = document.getElementById('game-arena');
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!hoveredItem || !ws || ws.readyState !== WebSocket.OPEN) return;

    const key = e.key.toLowerCase();
    const isShiftPressed = e.shiftKey;
    const expectedKey = hoveredItem.letter.toLowerCase();
    
    const isCorrect = hoveredItem.requiresShift
      ? isShiftPressed && key === expectedKey
      : !isShiftPressed && key === expectedKey;

    ws.send(JSON.stringify({
      type: 'collect-item',
      roomCode,
      playerId,
      itemId: hoveredItem.id,
      correct: isCorrect,
    }));

    const scoreData: FloatingScoreData = {
      id: Date.now().toString(),
      points: hoveredItem.points,
      position: { ...hoveredItem.position },
      success: isCorrect,
    };
    setFloatingScores(prev => [...prev, scoreData]);

    setHoveredItem(null);
  }, [hoveredItem, ws, roomCode, playerId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">Carregando jogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <header className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur">
        <Button
          data-testid="button-leave"
          variant="outline"
          size="icon"
          onClick={() => setLocation('/')}
        >
          <X className="w-5 h-5" />
        </Button>

        <GameTimer timeRemaining={room.timeRemaining} />

        <div className="w-10" />
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div
          id="game-arena"
          data-testid="game-arena"
          className="flex-1 relative cursor-none overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        >
          {room.items.map(item => (
            <CollectibleItemComponent
              key={item.id}
              item={item}
              isHovered={hoveredItem?.id === item.id}
            />
          ))}

          {room.players.map(player => (
            <MouseCursor
              key={player.id}
              position={player.position}
              color={player.color}
              playerName={player.name}
              isLocal={player.id === playerId}
            />
          ))}

          {floatingScores.map(score => (
            <FloatingScore
              key={score.id}
              points={score.points}
              position={score.position}
              success={score.success}
              onComplete={() => {
                setFloatingScores(prev => prev.filter(s => s.id !== score.id));
              }}
            />
          ))}

          {hoveredItem && (
            <LetterPrompt
              item={hoveredItem}
              onCorrect={() => {}}
              onIncorrect={() => {}}
            />
          )}
        </div>

        <div className="w-80 border-l border-border bg-card/80 backdrop-blur overflow-hidden">
          <ScoreBoard players={room.players} currentPlayerId={playerId || undefined} />
        </div>
      </div>
    </div>
  );
}
