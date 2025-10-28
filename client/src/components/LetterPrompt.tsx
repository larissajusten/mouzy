import { CollectibleItem } from '@shared/schema';
import { Keyboard } from 'lucide-react';

interface LetterPromptProps {
  item: CollectibleItem;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export function LetterPrompt({ item }: LetterPromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div data-testid="letter-prompt" className="bg-card border-2 border-primary rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Keyboard className="w-5 h-5" />
            <span className="text-sm font-medium">Pressione a tecla:</span>
          </div>
          
          <div className="text-center">
            <div data-testid="text-letter" className="text-8xl font-bold text-primary mb-4">
              {item.letter}
            </div>
            <div data-testid="text-points" className="text-lg text-muted-foreground font-medium">
              {item.points} {item.points === 1 ? 'ponto' : 'pontos'}
            </div>
          </div>

          {item.requiresShift && (
            <div className="flex items-center gap-3 text-lg font-semibold">
              <div data-testid="key-shift" className="px-4 py-2 bg-secondary rounded-lg border-2 border-border">
                Shift
              </div>
              <span className="text-2xl text-muted-foreground">+</span>
              <div data-testid="key-target" className="px-4 py-2 bg-secondary rounded-lg border-2 border-border">
                {item.letter}
              </div>
            </div>
          )}

          {!item.requiresShift && (
            <div data-testid="key-single" className="px-6 py-3 bg-secondary rounded-xl border-2 border-border text-2xl font-bold">
              {item.letter}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
