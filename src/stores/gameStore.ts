import { create } from "zustand";

interface GameState {
  score: number;
  bestScore: number;
  setScore: (score: number) => void;
  setBestScore: (bestScore: number) => void;
  incrementScore: (points: number) => void;
  resetScore: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 1,
  bestScore: 0,
  setScore: (score: number) => set({ score }),
  setBestScore: (bestScore: number) => set({ bestScore }),
  incrementScore: (points: number) =>
    set((state) => ({ score: state.score + points })),
  resetScore: () => set({ score: 0 }),
}));
