import { create } from "zustand";
import { InputManager } from "../managers/InputManager";
import React from "react";

interface GameState {
  score: number;
  bestScore: number;
  isDialogOpen: boolean;

  setScore: (score: number) => void;
  setBestScore: (bestScore: number) => void;
  openDialog: () => void;
  closeDialog: () => void;

  onClose?: () => void;
  setCloseCallback: (onClose: () => void) => void;

  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 1,
  bestScore: 0,
  isDialogOpen: false,
  onClose: undefined,
  setScore: (score: number) => set({ score }),
  setBestScore: (bestScore: number) => set({ bestScore }),
  openDialog: () => set({ isDialogOpen: true }),
  closeDialog: () => set({ isDialogOpen: false, onClose: undefined }),
  setCloseCallback: (onClose) => set({ onClose }),
  onPointerDown: (e) => {
    InputManager.triggerPointerDown(e.nativeEvent as PointerEvent);
  },
}));