import React from "react";
import { createRoot } from "react-dom/client";
import { Game } from "./Game";
import { GameUI } from "./components/GameUI";

import { getSafeAreaInsets } from "@apps-in-toss/web-framework";

import { isTossApp } from "./utils/platform";
import { initializeI18n } from "./utils/i18n";

async function loadFonts(): Promise<void> {
  const startTime = performance.now();

  const fontFace = new FontFace(
    "Inter",
    "url(/fonts/Inter-VariableFont_opsz,wght.ttf)"
  );

  try {
    const loadedFont = await fontFace.load();
    document.fonts.add(loadedFont);
    const loadTime = Math.round(performance.now() - startTime);
    console.log(`Inter font loaded (${loadTime} ms)`);
  } catch (error) {
    const loadTime = Math.round(performance.now() - startTime);
    console.warn(`Failed to load Inter font (${loadTime} ms):`, error);
  }
}

async function initializeApp() {
  // i18n 초기화
  initializeI18n();

  // 폰트 미리 로드
  await loadFonts();

  console.log("토스웹뷰:", isTossApp());

  if (isTossApp()) {
    const insets = getSafeAreaInsets();

    const container = document.getElementById("safe-area-wrap");
    if (container) {
      container.style.paddingTop = `${insets.top}px`;
      container.style.paddingBottom = `${insets.bottom}px`;
    }

    console.log("Platform: Toss");
  } else {
    console.log("Platform: Web");
  }

  console.log(`Device Pixel Ratio: ${window.devicePixelRatio}`);
}

await initializeApp();

// React UI 마운트
const uiElement = document.getElementById("ui");
if (uiElement) {
  const root = createRoot(uiElement);
  root.render(React.createElement(GameUI));
}

export const game = new Game().init();
