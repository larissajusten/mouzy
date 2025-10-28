import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Clock, Zap, ArrowLeft, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CreateRoomInput } from '@shared/schema';

export default function CreateRoom() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const playerName = params.get('name') || '';

  const [timerDuration, setTimerDuration] = useState<number | null>(120);
  const [difficulty, setDifficulty] = useState(1);

  const createRoomMutation = useMutation({
    mutationFn: async (input: CreateRoomInput) => {
      return await apiRequest<{ code: string; playerId: string }>('POST', '/api/rooms/create', input);
    },
    onSuccess: (data) => {
      setLocation(`/lobby/${data.code}?playerId=${data.playerId}`);
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a sala. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateRoom = () => {
    createRoomMutation.mutate({
      playerName,
      timerDuration,
      difficulty,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 space-y-8 shadow-2xl">
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
            <h1 data-testid="text-page-title" className="text-3xl font-bold">Criar Nova Sala</h1>
            <p data-testid="text-page-subtitle" className="text-muted-foreground">Configure sua partida</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="timer" className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Tempo de Jogo
            </Label>
            <Select
              value={timerDuration?.toString() || 'null'}
              onValueChange={(value) => setTimerDuration(value === 'null' ? null : parseInt(value))}
            >
              <SelectTrigger data-testid="select-timer" className="h-12 text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">1 minuto</SelectItem>
                <SelectItem value="120">2 minutos</SelectItem>
                <SelectItem value="180">3 minutos</SelectItem>
                <SelectItem value="300">5 minutos</SelectItem>
                <SelectItem value="null">Sem limite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Nível Inicial
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { level: 1, name: 'Vogais', desc: 'a, e, i, o, u', points: '1pt' },
                { level: 2, name: 'Consoantes', desc: 'b, c, d, f...', points: '2pts' },
                { level: 3, name: 'Maiúsculas', desc: 'Shift + letra', points: '3pts' },
                { level: 4, name: 'Símbolos', desc: 'Shift + tecla', points: '5pts' },
              ].map((item) => (
                <button
                  key={item.level}
                  data-testid={`button-difficulty-${item.level}`}
                  onClick={() => setDifficulty(item.level)}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    difficulty === item.level
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{item.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">{item.desc}</div>
                  <div className="text-xs font-semibold text-primary">{item.points}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          data-testid="button-create"
          onClick={handleCreateRoom}
          disabled={createRoomMutation.isPending}
          className="w-full h-14 text-lg font-bold gap-2"
          size="lg"
        >
          <Play className="w-5 h-5" />
          {createRoomMutation.isPending ? 'Criando...' : 'Criar Sala'}
        </Button>
      </Card>
    </div>
  );
}
