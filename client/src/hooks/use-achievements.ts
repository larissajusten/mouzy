import { useState, useEffect, useCallback } from 'react';
import { Achievement, ACHIEVEMENTS, PlayerProgress, DifficultyLevel } from '@shared/schema';

const STORAGE_KEY = 'ratinho-player-progress';

const getDefaultProgress = (playerId: string, playerName: string): PlayerProgress => ({
  playerId,
  playerName,
  totalGamesPlayed: 0,
  totalItemsCollected: 0,
  totalCorrectAttempts: 0,
  totalAttempts: 0,
  highestScore: 0,
  difficultiesCompleted: new Set<DifficultyLevel>(),
  uniqueOpponents: new Set<string>(),
  achievements: [],
  lastPlayedAt: Date.now(),
});

export const useAchievements = (playerId: string | null, playerName: string | null) => {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (!playerId || !playerName) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    const allProgress: Record<string, any> = stored ? JSON.parse(stored) : {};
    
    const playerProgress = allProgress[playerId];
    
    if (playerProgress) {
      setProgress({
        ...playerProgress,
        difficultiesCompleted: new Set(playerProgress.difficultiesCompleted || []),
        uniqueOpponents: new Set(playerProgress.uniqueOpponents || []),
        achievements: playerProgress.achievements || [],
      });
    } else {
      const defaultProgress = getDefaultProgress(playerId, playerName);
      setProgress(defaultProgress);
      allProgress[playerId] = {
        ...defaultProgress,
        difficultiesCompleted: Array.from(defaultProgress.difficultiesCompleted),
        uniqueOpponents: Array.from(defaultProgress.uniqueOpponents),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    }
  }, [playerId, playerName]);

  const saveProgress = useCallback((updatedProgress: PlayerProgress) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allProgress: Record<string, any> = stored ? JSON.parse(stored) : {};
    
    allProgress[updatedProgress.playerId] = {
      ...updatedProgress,
      difficultiesCompleted: Array.from(updatedProgress.difficultiesCompleted),
      uniqueOpponents: Array.from(updatedProgress.uniqueOpponents),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    setProgress(updatedProgress);
  }, []);

  const checkAchievements = useCallback((
    currentProgress: PlayerProgress,
    matchData?: {
      matchAccuracy?: number;
      matchScore?: number;
    }
  ): Achievement[] => {
    const unlocked: Achievement[] = [];
    const existingIds = new Set(currentProgress.achievements.map(a => a.id));

    for (const achievement of ACHIEVEMENTS) {
      if (existingIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.category) {
        case 'collection':
          if (achievement.id === 'dedicated-player') {
            shouldUnlock = currentProgress.totalGamesPlayed >= achievement.requirement;
          } else if (achievement.id === 'high-scorer') {
            shouldUnlock = (matchData?.matchScore || 0) >= achievement.requirement;
          } else {
            shouldUnlock = currentProgress.totalItemsCollected >= achievement.requirement;
          }
          break;
        case 'accuracy':
          if (matchData?.matchAccuracy !== undefined) {
            shouldUnlock = matchData.matchAccuracy >= achievement.requirement;
          }
          break;
        case 'difficulty':
          shouldUnlock = currentProgress.difficultiesCompleted.has(achievement.requirement as DifficultyLevel);
          break;
        case 'social':
          shouldUnlock = currentProgress.uniqueOpponents.size >= achievement.requirement;
          break;
      }

      if (shouldUnlock) {
        unlocked.push({ ...achievement, unlockedAt: Date.now() });
      }
    }

    return unlocked;
  }, []);

  const updateProgress = useCallback((updates: {
    itemsCollected?: number;
    correctAttempts?: number;
    totalAttempts?: number;
    score?: number;
    difficulty?: DifficultyLevel;
    gameCompleted?: boolean;
    opponents?: string[];
    matchAccuracy?: number;
    matchScore?: number;
  }) => {
    if (!progress) return;

    const updatedProgress: PlayerProgress = {
      ...progress,
      totalItemsCollected: progress.totalItemsCollected + (updates.itemsCollected || 0),
      totalCorrectAttempts: progress.totalCorrectAttempts + (updates.correctAttempts || 0),
      totalAttempts: progress.totalAttempts + (updates.totalAttempts || 0),
      highestScore: Math.max(progress.highestScore, updates.score || 0),
      totalGamesPlayed: progress.totalGamesPlayed + (updates.gameCompleted ? 1 : 0),
      lastPlayedAt: Date.now(),
    };

    if (updates.difficulty && updates.gameCompleted) {
      updatedProgress.difficultiesCompleted.add(updates.difficulty);
    }

    if (updates.opponents) {
      updates.opponents.forEach(opponentId => {
        updatedProgress.uniqueOpponents.add(opponentId);
      });
    }

    const newUnlocked = checkAchievements(updatedProgress, {
      matchAccuracy: updates.matchAccuracy,
      matchScore: updates.matchScore,
    });
    
    if (newUnlocked.length > 0) {
      updatedProgress.achievements = [...updatedProgress.achievements, ...newUnlocked];
      setNewAchievements(newUnlocked);
    }

    saveProgress(updatedProgress);
  }, [progress, checkAchievements, saveProgress]);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  return {
    progress,
    newAchievements,
    updateProgress,
    clearNewAchievements,
  };
};
