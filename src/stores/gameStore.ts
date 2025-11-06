import { create } from "zustand";
import { InputManager } from "../managers/InputManager";
import React from "react";

interface GameState {
  score: number;
  bestScore: number;
  isDialogOpen: boolean;

  remainingBalls: number;
  ballTextX : number;   
  viewScale : number;          
  
  setBallTextX : ( ballTextX : number) => void;
  setViewScale : (viewScale : number) => void;
  setRemainingBalls: (remainingBalls : number) => void;
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
  remainingBalls: 1,
  ballTextX : 175, //중앙
  viewScale : 515,
  setRemainingBalls: ((remainingBalls : number) => set({remainingBalls})),
  setBallTextX:((ballTextX : number) => set({ballTextX})),
  setViewScale:((viewScale : number) => set({viewScale})),
  setScore: (score: number) => set({ score }),
  setBestScore: (bestScore: number) => set({ bestScore }),
  openDialog: () => set({ isDialogOpen: true }),
  closeDialog: () => set({ isDialogOpen: false, onClose: undefined }),
  setCloseCallback: (onClose) => set({ onClose }),
  onPointerDown: (e) => {
    InputManager.triggerPointerDown(e.nativeEvent as PointerEvent);
  },
}));