import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reducer } from './use-toast';

describe('toast reducer', () => {
  const initialState = { toasts: [] };

  beforeEach(() => {
    vi.clearAllTimers();
  });

  describe('ADD_TOAST', () => {
    it('adds a toast to empty state', () => {
      const toast = { id: '1', title: 'Test', open: true };
      const action = { type: 'ADD_TOAST' as const, toast };
      const newState = reducer(initialState, action);
      
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0]).toEqual(toast);
    });

    it('respects TOAST_LIMIT of 1', () => {
      const state = {
        toasts: [{ id: '1', title: 'First', open: true }]
      };
      const toast = { id: '2', title: 'Second', open: true };
      const action = { type: 'ADD_TOAST' as const, toast };
      const newState = reducer(state, action);
      
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe('2');
    });

    it('adds new toast at the beginning', () => {
      const toast = { id: '2', title: 'New', open: true };
      const action = { type: 'ADD_TOAST' as const, toast };
      const newState = reducer(initialState, action);
      
      expect(newState.toasts[0].id).toBe('2');
    });
  });

  describe('UPDATE_TOAST', () => {
    it('updates specific toast', () => {
      const state = {
        toasts: [
          { id: '1', title: 'First', open: true },
        ]
      };
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: { id: '1', title: 'Updated' }
      };
      const newState = reducer(state, action);
      
      expect(newState.toasts[0].title).toBe('Updated');
    });

    it('does not update other toasts', () => {
      const state = {
        toasts: [{ id: '1', title: 'Original', open: true }]
      };
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: { id: '2', title: 'Updated' }
      };
      const newState = reducer(state, action);
      
      expect(newState.toasts[0].title).toBe('Original');
    });
  });

  describe('DISMISS_TOAST', () => {
    it('dismisses specific toast', () => {
      const state = {
        toasts: [{ id: '1', title: 'Test', open: true }]
      };
      const action = { type: 'DISMISS_TOAST' as const, toastId: '1' };
      const newState = reducer(state, action);
      
      expect(newState.toasts[0].open).toBe(false);
    });

    it('dismisses all toasts when no id provided', () => {
      const state = {
        toasts: [
          { id: '1', title: 'First', open: true },
        ]
      };
      const action = { type: 'DISMISS_TOAST' as const };
      const newState = reducer(state, action);
      
      expect(newState.toasts[0].open).toBe(false);
    });
  });

  describe('REMOVE_TOAST', () => {
    it('removes specific toast', () => {
      const state = {
        toasts: [{ id: '1', title: 'Test', open: true }]
      };
      const action = { type: 'REMOVE_TOAST' as const, toastId: '1' };
      const newState = reducer(state, action);
      
      expect(newState.toasts).toHaveLength(0);
    });

    it('removes all toasts when no id provided', () => {
      const state = {
        toasts: [
          { id: '1', title: 'First', open: true },
        ]
      };
      const action = { type: 'REMOVE_TOAST' as const };
      const newState = reducer(state, action);
      
      expect(newState.toasts).toHaveLength(0);
    });

    it('keeps other toasts when removing specific one', () => {
      const state = {
        toasts: [{ id: '1', title: 'Keep', open: true }]
      };
      const action = { type: 'REMOVE_TOAST' as const, toastId: '2' };
      const newState = reducer(state, action);
      
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe('1');
    });
  });
});
