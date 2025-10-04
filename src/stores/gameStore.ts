import { create } from "zustand";

interface GameState {
  score: number;
  setScore: (score: number) => void;
  incrementScore: (points: number) => void;
  resetScore: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 1,
  setScore: (score: number) => set({ score }),
  incrementScore: (points: number) =>
    set((state) => ({ score: state.score + points })),
  resetScore: () => set({ score: 0 }),
}));
