import { create } from "zustand";

interface GameState {
  score: number;
  bestScore: number;
  isDialogOpen: boolean;
  onClose?: () => void;
  setScore: (score: number) => void;
  setBestScore: (bestScore: number) => void;
  incrementScore: (points: number) => void;
  resetScore: () => void;
  openDialog: () => void;
  closeDialog: () => void;
  setCloseCallback: (onClose: () => void) => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 1,
  bestScore: 0,
  isDialogOpen: false,
  onClose: undefined,
  setScore: (score: number) => set({ score }),
  setBestScore: (bestScore: number) => set({ bestScore }),
  incrementScore: (points: number) =>
    set((state) => ({ score: state.score + points })),
  resetScore: () => set({ score: 0 }),
  openDialog: () => set({ isDialogOpen: true }),
  closeDialog: () => set({ isDialogOpen: false, onClose: undefined }),
  setCloseCallback: (onClose) => set({ onClose }),
}));
