import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { JoinRoomInput } from '@shared/schema';

export default function JoinRoom() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const playerName = params.get('name') || '';

  const [roomCode, setRoomCode] = useState('');

  const joinRoomMutation = useMutation({
    mutationFn: async (input: JoinRoomInput) => {
      return await apiRequest<{ playerId: string }>('POST', '/api/rooms/join', input);
    },
    onSuccess: (data) => {
      setLocation(`/lobby/${roomCode.toUpperCase()}?playerId=${data.playerId}`);
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Sala não encontrada ou não disponível.',
        variant: 'destructive',
      });
    },
  });

  const handleJoinRoom = () => {
    if (roomCode.trim().length === 6) {
      joinRoomMutation.mutate({
        playerName,
        roomCode: roomCode.toUpperCase(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 space-y-8 shadow-2xl">
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
            <h1 data-testid="text-page-title" className="text-3xl font-bold">Entrar em Sala</h1>
            <p data-testid="text-page-subtitle" className="text-muted-foreground">Digite o código da sala</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-code" className="text-lg font-semibold">
              Código da Sala
            </Label>
            <Input
              id="room-code"
              data-testid="input-room-code"
              type="text"
              placeholder="Ex: ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-2xl h-14 text-center font-bold tracking-widest"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && roomCode.trim().length === 6) {
                  handleJoinRoom();
                }
              }}
            />
            <p className="text-sm text-muted-foreground text-center">
              O código tem 6 caracteres
            </p>
          </div>

          <Button
            data-testid="button-join"
            onClick={handleJoinRoom}
            disabled={roomCode.trim().length !== 6 || joinRoomMutation.isPending}
            className="w-full h-14 text-lg font-bold gap-2"
            size="lg"
          >
            <Users className="w-5 h-5" />
            {joinRoomMutation.isPending ? 'Entrando...' : 'Entrar na Sala'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
