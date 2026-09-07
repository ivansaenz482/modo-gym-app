import { create } from 'zustand';

type State = {
  running: boolean;
  startedAt: number | null;
  accumulated: number;
  start: () => void;
  pause: () => void;
  stop: () => void;
  getElapsed: () => number;
};

export const useWorkoutStore = create<State>((set, get) => ({
  running: false,
  startedAt: null,
  accumulated: 0,
  start: () => {
    if (get().running) return;
    set({ running: true, startedAt: Date.now() });
  },
  pause: () => {
    if (!get().running) return;
    set({ running: false, accumulated: get().getElapsed(), startedAt: null });
  },
  stop: () => {
    set({ running: false, accumulated: 0, startedAt: null });
  },
  getElapsed: () => {
    const { running, startedAt, accumulated } = get();
    if (!running || !startedAt) return accumulated;
    return accumulated + Math.floor((Date.now() - startedAt) / 1000);
  },
}));
