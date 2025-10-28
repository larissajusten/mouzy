import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Achievement, ACHIEVEMENTS } from '@shared/schema';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';

export default function Achievements() {
  const [playerProgress, setPlayerProgress] = useState<any>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('playerId');
    setPlayerId(id);

    if (id) {
      const stored = localStorage.getItem('ratinho-player-progress');
      if (stored) {
        const allProgress = JSON.parse(stored);
        setPlayerProgress(allProgress[id]);
      }
    }
  }, []);

  const unlockedIds = new Set(playerProgress?.achievements?.map((a: Achievement) => a.id) || []);

  const categories = [
    { id: 'collection', name: 'Coleção', color: 'from-blue-500 to-cyan-500' },
    { id: 'accuracy', name: 'Precisão', color: 'from-green-500 to-emerald-500' },
    { id: 'difficulty', name: 'Dificuldade', color: 'from-purple-500 to-pink-500' },
    { id: 'speed', name: 'Velocidade', color: 'from-orange-500 to-red-500' },
    { id: 'social', name: 'Social', color: 'from-yellow-500 to-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href={`/?playerId=${playerId}`}>
            <Button variant="outline" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-4xl font-extrabold text-foreground" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Conquistas
          </h1>
          <div className="w-10" />
        </div>

        {playerProgress && (
          <div className="bg-card rounded-xl p-6 mb-8 border border-border">
            <h2 className="text-xl font-bold mb-4">Progresso Geral</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{unlockedIds.size}</p>
                <p className="text-sm text-muted-foreground">Conquistas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">{playerProgress.totalItemsCollected || 0}</p>
                <p className="text-sm text-muted-foreground">Itens Coletados</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{playerProgress.totalGamesPlayed || 0}</p>
                <p className="text-sm text-muted-foreground">Partidas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">{playerProgress.highestScore || 0}</p>
                <p className="text-sm text-muted-foreground">Maior Pontuação</p>
              </div>
            </div>
          </div>
        )}

        {categories.map(category => {
          const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category.id);
          
          return (
            <div key={category.id} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <div className={`w-1 h-8 rounded bg-gradient-to-b ${category.color}`} />
                {category.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map(achievement => {
                  const isUnlocked = unlockedIds.has(achievement.id);
                  const IconComponent = (LucideIcons as any)[achievement.icon] || LucideIcons.Award;

                  return (
                    <div
                      key={achievement.id}
                      data-testid={`achievement-${achievement.id}`}
                      className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                        isUnlocked
                          ? 'border-primary bg-card hover-elevate'
                          : 'border-border bg-muted/50'
                      }`}
                    >
                      <div className="p-4 flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isUnlocked
                              ? `bg-gradient-to-br ${category.color}`
                              : 'bg-muted'
                          }`}
                        >
                          {isUnlocked ? (
                            <IconComponent className="w-6 h-6 text-white" />
                          ) : (
                            <Lock className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-sm ${
                              isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {achievement.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      {isUnlocked && (
                        <div className={`h-1 w-full bg-gradient-to-r ${category.color}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
