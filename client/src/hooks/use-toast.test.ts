import { describe, it, expect } from 'vitest';

type ToastActionType = "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST" | "REMOVE_TOAST";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  [key: string]: any;
};

type State = {
  toasts: Toast[];
};

type Action =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "UPDATE_TOAST"; toast: Partial<Toast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

const TOAST_LIMIT = 1;

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

describe('toast reducer', () => {
  const initialState: State = { toasts: [] };

  describe('ADD_TOAST', () => {
    it('adds a toast to empty state', () => {
      const toast: Toast = { id: '1', title: 'Test' };
      const action = { type: 'ADD_TOAST' as const, toast };
      const newState = reducer(initialState, action);
      
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0]).toEqual(toast);
    });

    it('respects TOAST_LIMIT', () => {
      const state: State = {
        toasts: [{ id: '1', title: 'First' }]
      };
      const toast: Toast = { id: '2', title: 'Second' };
      const action = { type: 'ADD_TOAST' as const, toast };
      const newState = reducer(state, action);
      
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe('2');
    });

    it('adds new toast at the beginning', () => {
      const toast: Toast = { id: '2', title: 'New' };
      const action = { type: 'ADD_TOAST' as const, toast };
      const newState = reducer(initialState, action);
      
      expect(newState.toasts[0].id).toBe('2');
    });
  });

  describe('UPDATE_TOAST', () => {
    it('updates specific toast', () => {
      const state: State = {
        toasts: [
          { id: '1', title: 'First' },
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
      const state: State = {
        toasts: [{ id: '1', title: 'Original' }]
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
      const state: State = {
        toasts: [{ id: '1', title: 'Test', open: true }]
      };
      const action = { type: 'DISMISS_TOAST' as const, toastId: '1' };
      const newState = reducer(state, action);
      
      expect(newState.toasts[0].open).toBe(false);
    });

    it('dismisses all toasts when no id provided', () => {
      const state: State = {
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
      const state: State = {
        toasts: [{ id: '1', title: 'Test' }]
      };
      const action = { type: 'REMOVE_TOAST' as const, toastId: '1' };
      const newState = reducer(state, action);
      
      expect(newState.toasts).toHaveLength(0);
    });

    it('removes all toasts when no id provided', () => {
      const state: State = {
        toasts: [
          { id: '1', title: 'First' },
        ]
      };
      const action = { type: 'REMOVE_TOAST' as const };
      const newState = reducer(state, action);
      
      expect(newState.toasts).toHaveLength(0);
    });

    it('keeps other toasts when removing specific one', () => {
      const state: State = {
        toasts: [{ id: '1', title: 'Keep' }]
      };
      const action = { type: 'REMOVE_TOAST' as const, toastId: '2' };
      const newState = reducer(state, action);
      
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe('1');
    });
  });
});
