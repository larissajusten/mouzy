import { useEffect, useState, useCallback, useRef } from 'react';
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
import { playCorrectSound, playIncorrectSound, playCollectSound } from '@/lib/sounds';
import { useWebSocket } from '@/hooks/use-websocket';

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
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState<CollectibleItem | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScoreData[]>([]);
  const lastSentPosition = useRef({ x: 0, y: 0, time: 0 });

  const currentPlayer = room?.players.find(p => p.id === playerId);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'room-state') {
      setRoom(message.room);
      
      if (message.room.gameState === 'finished') {
        setLocation(`/results/${roomCode}?playerId=${playerId}`);
      }
    } else if (message.type === 'game-started') {
      setRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: message.items,
          gameState: 'playing',
          startedAt: message.startedAt,
        };
      });
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
    } else if (message.type === 'item-respawned') {
      setRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: [...prev.items, message.item],
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
  }, [roomCode, playerId, setLocation]);

  const { sendMessage } = useWebSocket({
    roomCode,
    playerId,
    onMessage: handleWebSocketMessage,
  });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });

    // Throttle: enviar atualização de posição apenas a cada 50ms
    const now = Date.now();
    const timeSinceLastSend = now - lastSentPosition.current.time;
    const distanceMoved = Math.sqrt(
      Math.pow(x - lastSentPosition.current.x, 2) + Math.pow(y - lastSentPosition.current.y, 2)
    );

    if (timeSinceLastSend > 50 || distanceMoved > 10) {
      sendMessage({
        type: 'player-move',
        roomCode,
        playerId,
        position: { x, y },
      });
      lastSentPosition.current.x = x;
      lastSentPosition.current.y = y;
      lastSentPosition.current.time = now;
    }

    if (!room) return;

    const hovered = room.items.find(item => {
      const distance = Math.sqrt(
        Math.pow(item.position.x - x, 2) + Math.pow(item.position.y - y, 2)
      );
      return distance < 40;
    });

    setHoveredItem(hovered || null);
  }, [room, roomCode, playerId, sendMessage]);

  // React-managed mouse move via onMouseMove avoids event listener timing issues

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!hoveredItem) return;

    const key = e.key;
    
    // Ignorar teclas modificadoras (Shift, Ctrl, Alt, Meta)
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(key)) {
      return;
    }

    const expectedLetter = hoveredItem.letter;
    
    // Para maiúsculas: verificar se é a letra correta (case-insensitive) E Shift está pressionado
    // Para símbolos e caracteres especiais: verificar correspondência exata
    const isCorrect = hoveredItem.requiresShift
      ? key === expectedLetter
      : key.toLowerCase() === expectedLetter.toLowerCase();

    if (isCorrect) {
      playCorrectSound();
      playCollectSound();
    } else {
      playIncorrectSound();
    }

    sendMessage({
      type: 'collect-item',
      roomCode,
      playerId,
      itemId: hoveredItem.id,
      correct: isCorrect,
    });

    const scoreData: FloatingScoreData = {
      id: Date.now().toString(),
      points: hoveredItem.points,
      position: { ...hoveredItem.position },
      success: isCorrect,
    };
    setFloatingScores(prev => [...prev, scoreData]);

    setHoveredItem(null);
  }, [hoveredItem, roomCode, playerId, sendMessage]);

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
          onMouseMove={handleMouseMove}
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
              position={player.id === playerId ? mousePosition : player.position}
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
