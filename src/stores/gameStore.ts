import { create } from "zustand";
import { InputManager } from "../managers/InputManager";
import React from "react";

interface GameState {
  score: number;
  bestScore: number;
  isDialogOpen: boolean;

  numBalls: number;
  ballx : number;             
  
  setBallx : ( ballx : number) => void;
  setNumBalls: (value: number | ((prev: number) => number)) => void;
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
  numBalls: 1,
  ballx : 175, //중앙
  setNumBalls: (value: number | ((prev: number) => number)) =>
  set(state => ({
      numBalls: typeof value === "function" ? value(state.numBalls) : value
    })),
  setBallx:((ballx : number) => set({ballx})),
  setScore: (score: number) => set({ score }),
  setBestScore: (bestScore: number) => set({ bestScore }),
  openDialog: () => set({ isDialogOpen: true }),
  closeDialog: () => set({ isDialogOpen: false, onClose: undefined }),
  setCloseCallback: (onClose) => set({ onClose }),
  onPointerDown: (e) => {
    InputManager.triggerPointerDown(e.nativeEvent as PointerEvent);
  },
}));