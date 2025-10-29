import { describe, it, expect } from 'vitest';

function getHueRotation(color: string): number {
  const colorMap: Record<string, number> = {
    '#EF4444': 0,
    '#3B82F6': 220,
    '#10B981': 140,
    '#F59E0B': 40,
    '#A855F7': 280,
    '#F97316': 20,
    '#EC4899': 320,
    '#14B8A6': 180,
  };
  return colorMap[color] || 0;
}

describe('getHueRotation', () => {
  it('returns correct hue for red color', () => {
    expect(getHueRotation('#EF4444')).toBe(0);
  });

  it('returns correct hue for blue color', () => {
    expect(getHueRotation('#3B82F6')).toBe(220);
  });

  it('returns correct hue for green color', () => {
    expect(getHueRotation('#10B981')).toBe(140);
  });

  it('returns correct hue for yellow color', () => {
    expect(getHueRotation('#F59E0B')).toBe(40);
  });

  it('returns correct hue for purple color', () => {
    expect(getHueRotation('#A855F7')).toBe(280);
  });

  it('returns correct hue for orange color', () => {
    expect(getHueRotation('#F97316')).toBe(20);
  });

  it('returns correct hue for pink color', () => {
    expect(getHueRotation('#EC4899')).toBe(320);
  });

  it('returns correct hue for teal color', () => {
    expect(getHueRotation('#14B8A6')).toBe(180);
  });

  it('returns 0 for unknown color', () => {
    expect(getHueRotation('#FFFFFF')).toBe(0);
  });

  it('returns 0 for empty string', () => {
    expect(getHueRotation('')).toBe(0);
  });
});
