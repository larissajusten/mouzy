import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn (className merge)', () => {
    it('merges class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
    });

    it('handles undefined and null', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end');
    });

    it('handles objects with boolean values', () => {
      expect(cn({ 'class-1': true, 'class-2': false })).toBe('class-1');
    });

    it('merges tailwind classes correctly', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
    });
  });
});
