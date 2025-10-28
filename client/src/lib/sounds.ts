let audioContext: AudioContext | null = null;

const getAudioContext = async (): Promise<AudioContext | null> => {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  
  return audioContext;
};

export const playCorrectSound = async () => {
  const ctx = await getAudioContext();
  if (!ctx) return;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
  oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
  
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.3);
  
  setTimeout(() => {
    oscillator.disconnect();
    gainNode.disconnect();
  }, 350);
};

export const playIncorrectSound = async () => {
  const ctx = await getAudioContext();
  if (!ctx) return;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(200, ctx.currentTime);
  oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
  
  oscillator.type = 'sawtooth';
  
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.25);
  
  setTimeout(() => {
    oscillator.disconnect();
    gainNode.disconnect();
  }, 300);
};

export const playCollectSound = async () => {
  const ctx = await getAudioContext();
  if (!ctx) return;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(800, ctx.currentTime);
  oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.05);
  
  oscillator.type = 'square';
  
  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.15);
  
  setTimeout(() => {
    oscillator.disconnect();
    gainNode.disconnect();
  }, 200);
};
