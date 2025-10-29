import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MousePointer2, Users, Play, Trophy, GraduationCap } from 'lucide-react';
import mouseImage from '@assets/generated_images/cheerful_mouse_mascot_character.png';
import cheeseImage from '@assets/generated_images/yellow_cheese.png';
import appleImage from '@assets/generated_images/red_apple.png';
import breadImage from '@assets/generated_images/bread_loaf.png';

export default function Home() {
  const [, setLocation] = useLocation();
  const [playerName, setPlayerName] = useState('');
  const [storedPlayerId, setStoredPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('playerId');
    if (id) {
      setStoredPlayerId(id);
      const stored = localStorage.getItem('ratinho-player-progress');
      if (stored) {
        const allProgress = JSON.parse(stored);
        const progress = allProgress[id];
        if (progress?.playerName) {
          setPlayerName(progress.playerName);
        }
      }
    }
  }, []);

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      setLocation(`/create?name=${encodeURIComponent(playerName)}`);
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim()) {
      setLocation(`/join?name=${encodeURIComponent(playerName)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <img data-testid="img-decoration-cheese-1" src={cheeseImage} alt="" className="absolute top-10 left-10 w-16 h-16" />
        <img data-testid="img-decoration-apple" src={appleImage} alt="" className="absolute top-20 right-20 w-14 h-14" />
        <img data-testid="img-decoration-bread" src={breadImage} alt="" className="absolute bottom-20 left-20 w-14 h-14" />
        <img data-testid="img-decoration-cheese-2" src={cheeseImage} alt="" className="absolute bottom-10 right-10 w-16 h-16" />
        <div data-testid="text-decoration-a" className="absolute top-1/3 left-1/4 text-4xl font-bold text-primary">A</div>
        <div data-testid="text-decoration-b" className="absolute top-2/3 right-1/4 text-4xl font-bold text-primary">B</div>
        <div data-testid="text-decoration-c" className="absolute top-1/2 right-1/3 text-4xl font-bold text-primary">C</div>
      </div>

      <Card className="max-w-lg w-full p-8 space-y-8 relative z-10 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4 animate-bounce">
            <img
              data-testid="img-mascot"
              src={mouseImage}
              alt="Ratinho"
              className="w-32 h-32 drop-shadow-lg"
            />
          </div>
          <h1 data-testid="text-title" className="text-5xl font-bold text-primary">
            Ratinho Caça-Letras
          </h1>
          <p data-testid="text-subtitle" className="text-lg text-muted-foreground font-medium">
            Aprenda letras enquanto se diverte!
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="player-name" className="text-lg font-semibold">
              Qual é o seu nome?
            </Label>
            <Input
              id="player-name"
              data-testid="input-player-name"
              type="text"
              placeholder="Digite seu nome..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="text-lg h-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && playerName.trim()) {
                  handleCreateRoom();
                }
              }}
            />
          </div>

          <div className="space-y-3 pt-4">
            <Button
              data-testid="button-create-room"
              onClick={handleCreateRoom}
              disabled={!playerName.trim()}
              className="w-full h-14 text-lg font-bold gap-2"
              size="lg"
            >
              <Play className="w-5 h-5" />
              Criar Sala
            </Button>

            <Button
              data-testid="button-join-room"
              onClick={handleJoinRoom}
              disabled={!playerName.trim()}
              variant="outline"
              className="w-full h-14 text-lg font-bold gap-2"
              size="lg"
            >
              <Users className="w-5 h-5" />
              Entrar em Sala
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <Button
            data-testid="button-training"
            onClick={() => {
              const id = storedPlayerId || `player-${Date.now()}`;
              setLocation(`/training?playerId=${id}`);
            }}
            variant="outline"
            className="w-full gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            Modo Treino
          </Button>

          <Button
            data-testid="button-achievements"
            onClick={() => {
              const id = storedPlayerId || `player-${Date.now()}`;
              setLocation(`/achievements?playerId=${id}`);
            }}
            variant="outline"
            className="w-full gap-2"
          >
            <Trophy className="w-4 h-4" />
            Ver Conquistas
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <MousePointer2 className="w-4 h-4" />
            <span>Use o mouse para controlar o ratinho</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
