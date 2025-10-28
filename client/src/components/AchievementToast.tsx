import { useEffect, useState } from 'react';
import { Achievement } from '@shared/schema';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  achievements: Achievement[];
  onDismiss: () => void;
}

export function AchievementToast({ achievements, onDismiss }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (achievements.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length, onDismiss]);

  if (achievements.length === 0 || !visible) return null;

  const achievement = achievements[currentIndex];
  const IconComponent = (LucideIcons as any)[achievement.icon] || LucideIcons.Award;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        data-testid="achievement-toast"
      >
        <div className="bg-gradient-to-r from-primary via-accent to-primary p-1 rounded-xl shadow-2xl">
          <div className="bg-card rounded-lg p-4 flex items-center gap-4 min-w-[320px]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Conquista Desbloqueada!
              </p>
              <h3 className="text-lg font-bold text-foreground mt-1">
                {achievement.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {achievement.description}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
