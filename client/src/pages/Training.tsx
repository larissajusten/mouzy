import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { CollectibleItem, Position, DifficultyLevel, ITEM_CONFIGS } from '@shared/schema';
import { MouseCursor } from '@/components/MouseCursor';
import { CollectibleItemComponent } from '@/components/CollectibleItemComponent';
import { LetterPrompt } from '@/components/LetterPrompt';
import { FloatingScore } from '@/components/FloatingScore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { playCorrectSound, playIncorrectSound, playCollectSound } from '@/lib/sounds';
import { randomUUID } from 'crypto';

interface FloatingScoreData {
  id: string;
  points: number;
  position: Position;
  success: boolean;
}

interface PerformanceHistory {
  correct: boolean;
  difficulty: DifficultyLevel;
}

const generateTrainingItems = (difficulty: DifficultyLevel, count: number = 10): CollectibleItem[] => {
  const items: CollectibleItem[] = [];
  const arenaWidth = 1200;
  const arenaHeight = 700;
  const minDistance = 80;

  const getRandomPosition = (): Position => {
    return {
      x: Math.random() * (arenaWidth - 100) + 50,
      y: Math.random() * (arenaHeight - 100) + 50,
    };
  };

  const isFarEnough = (pos: Position, existingPositions: Position[]): boolean => {
    return existingPositions.every(existing => {
      const distance = Math.sqrt(
        Math.pow(pos.x - existing.x, 2) + Math.pow(pos.y - existing.y, 2)
      );
      return distance >= minDistance;
    });
  };

  const letterSets = {
    [DifficultyLevel.VOGAIS]: ['a', 'e', 'i', 'o', 'u'],
    [DifficultyLevel.CONSOANTES]: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z'],
    [DifficultyLevel.MAIUSCULAS]: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    [DifficultyLevel.SIMBOLOS]: ['!', '@', '#', '$', '%', '&', '*', '(', ')', '+', '=', '<', '>', '?', ':', ';'],
  };

  const itemTypes = ['cheese-small', 'cheese-medium', 'apple', 'bread'] as const;
  const positions: Position[] = [];

  for (let i = 0; i < count; i++) {
    let position: Position;
    let attempts = 0;
    do {
      position = getRandomPosition();
      attempts++;
    } while (!isFarEnough(position, positions) && attempts < 50);

    positions.push(position);

    const letters = letterSets[difficulty];
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    const config = ITEM_CONFIGS[type];
    const points = Math.floor(Math.random() * (config.maxPoints - config.minPoints + 1)) + config.minPoints;

    items.push({
      id: `item-${Date.now()}-${i}`,
      type,
      position,
      letter,
      difficultyLevel: difficulty,
      points,
      requiresShift: difficulty === DifficultyLevel.MAIUSCULAS || difficulty === DifficultyLevel.SIMBOLOS,
    });
  }

  return items;
};

export default function Training() {
  const [, setLocation] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const playerId = queryParams.get('playerId');

  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.VOGAIS);
  const [items, setItems] = useState<CollectibleItem[]>([]);
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState<CollectibleItem | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScoreData[]>([]);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistory[]>([]);
  const [difficultyTrend, setDifficultyTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    setItems(generateTrainingItems(difficulty, 10));
  }, [difficulty]);

  const adjustDifficulty = useCallback((history: PerformanceHistory[]) => {
    if (history.length < 5) return;

    const recent = history.slice(-5);
    const correctCount = recent.filter(h => h.correct).length;
    const accuracy = correctCount / recent.length;

    if (accuracy >= 0.8 && difficulty < DifficultyLevel.SIMBOLOS) {
      setDifficulty(prev => prev + 1 as DifficultyLevel);
      setDifficultyTrend('up');
      setTimeout(() => setDifficultyTrend('stable'), 2000);
    } else if (accuracy <= 0.4 && difficulty > DifficultyLevel.VOGAIS) {
      setDifficulty(prev => prev - 1 as DifficultyLevel);
      setDifficultyTrend('down');
      setTimeout(() => setDifficultyTrend('stable'), 2000);
    }
  }, [difficulty]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = document.getElementById('training-arena');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });

    const hovered = items.find(item => {
      const distance = Math.sqrt(
        Math.pow(item.position.x - x, 2) + Math.pow(item.position.y - y, 2)
      );
      return distance < 40;
    });

    setHoveredItem(hovered || null);
  }, [items]);

  useEffect(() => {
    const container = document.getElementById('training-arena');
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!hoveredItem) return;

    const key = e.key;
    
    // Ignorar teclas modificadoras (Shift, Ctrl, Alt, Meta)
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(key)) {
      return;
    }

    const expectedLetter = hoveredItem.letter;

    console.log('🔑 Tecla pressionada:', {
      key,
      expectedLetter,
      requiresShift: hoveredItem.requiresShift,
      shiftKey: e.shiftKey,
      difficultyLevel: hoveredItem.difficultyLevel
    });

    // Para maiúsculas: verificar se é a letra correta (case-insensitive) E Shift está pressionado
    // Para símbolos e caracteres especiais: verificar correspondência exata
    const isCorrect = hoveredItem.requiresShift
      ? key === expectedLetter
      : key.toLowerCase() === expectedLetter.toLowerCase();

    console.log('✅ Resultado:', isCorrect ? 'CORRETO' : 'INCORRETO');

    if (isCorrect) {
      playCorrectSound();
      playCollectSound();
      setScore(prev => prev + hoveredItem.points);
      setCorrectAttempts(prev => prev + 1);
    } else {
      playIncorrectSound();
    }

    setTotalAttempts(prev => prev + 1);

    const scoreData: FloatingScoreData = {
      id: Date.now().toString(),
      points: hoveredItem.points,
      position: { ...hoveredItem.position },
      success: isCorrect,
    };
    setFloatingScores(prev => [...prev, scoreData]);

    const newHistory = [...performanceHistory, {
      correct: isCorrect,
      difficulty: hoveredItem.difficultyLevel,
    }];
    setPerformanceHistory(newHistory);
    adjustDifficulty(newHistory);

    setItems(prev => {
      const filtered = prev.filter(i => i.id !== hoveredItem.id);
      if (filtered.length < 3) {
        return [...filtered, ...generateTrainingItems(difficulty, 7)];
      }
      return filtered;
    });

    setHoveredItem(null);
  }, [hoveredItem, performanceHistory, difficulty, adjustDifficulty]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const difficultyNames = {
    [DifficultyLevel.VOGAIS]: 'Vogais',
    [DifficultyLevel.CONSOANTES]: 'Consoantes',
    [DifficultyLevel.MAIUSCULAS]: 'Maiúsculas',
    [DifficultyLevel.SIMBOLOS]: 'Símbolos',
  };

  const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <header className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur">
        <Button
          data-testid="button-back"
          variant="outline"
          size="icon"
          onClick={() => setLocation(`/?playerId=${playerId}`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-4">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Nível:</span>
              <span className="text-lg font-bold text-foreground">{difficultyNames[difficulty]}</span>
              {difficultyTrend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 animate-bounce" />}
              {difficultyTrend === 'down' && <TrendingDown className="w-4 h-4 text-orange-500 animate-bounce" />}
              {difficultyTrend === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
            </div>
          </Card>
          
          <Card className="px-4 py-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{score}</p>
              <p className="text-xs text-muted-foreground">Pontos</p>
            </div>
          </Card>

          <Card className="px-4 py-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{accuracy.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Precisão</p>
            </div>
          </Card>
        </div>

        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-hidden">
        <div
          id="training-arena"
          data-testid="training-arena"
          className="w-full h-full relative cursor-none"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        >
          {items.map(item => (
            <CollectibleItemComponent
              key={item.id}
              item={item}
              isHovered={hoveredItem?.id === item.id}
            />
          ))}

          <MouseCursor
            position={mousePosition}
            color="#A855F7"
            playerName="Você"
            isLocal={true}
          />

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
      </div>
    </div>
  );
}
