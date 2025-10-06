import React from "react";
import { createRoot } from "react-dom/client";
import { Game } from "./Game";
import { GameUI } from "./components/GameUI";

import { getSafeAreaInsets } from "@apps-in-toss/web-framework";

import { isTossApp } from "./utils/platform";
import { initializeI18n } from "./utils/i18n";

// Console timestamp wrapper
const originalLog = console.log;
let startTime = performance.now();

console.log = (...args) => {
  const elapsed = Math.floor(performance.now() - startTime);
  originalLog(`[${elapsed}ms]`, ...args);
};

async function initializeApp() {
  // i18n 초기화
  initializeI18n();

  if (isTossApp()) {
    const insets = getSafeAreaInsets();

    const container = document.getElementById("safe-area-wrap");
    if (container) {
      container.style.paddingTop = `${insets.top}px`;
      container.style.paddingBottom = `${insets.bottom}px`;
    }

    console.log("Current Platform: Toss");
  } else {
    console.log("Current Platform: Web");
  }

  console.log(`Device pixel ratio: ${window.devicePixelRatio}`);
}

initializeApp();

// React UI 마운트
const uiElement = document.getElementById("ui");
if (uiElement) {
  const root = createRoot(uiElement);
  root.render(React.createElement(GameUI));
}

export const game = new Game().init();
