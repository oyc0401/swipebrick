import React from "react";
import { createRoot } from "react-dom/client";
import { Game } from "./Game";
import { GameUI } from "./components/GameUI";

import { getSafeAreaInsets } from "@apps-in-toss/web-framework";

import { isTossApp, isAndroidWebView } from "./utils/platform";
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

function disableLoupe() {
  // 루페 막기
  let lastTapTime = 0;

  window.addEventListener(
    "touchstart",
    (e) => {
      const now = Date.now();
      const isSecondTap = now - lastTapTime < 350; // 더블탭-홀드 케이스
      lastTapTime = now;
      if (isSecondTap) {
        // 두 번째 touchstart에서 바로 long-press 타이머 시작
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // (선택) iOS 13+에서 뜨는 컨텍스트 메뉴 이벤트도 방어
  window.addEventListener("contextmenu", (e) => e.preventDefault());
}

async function initializeApp() {
  // i18n 초기화
  initializeI18n();

  // 폰트 미리 로드
  await loadFonts();

  const container = document.getElementById("safe-area-wrap");

  if (false && isAndroidWebView()) {
    // // 안드로이드 WebView: SafeArea 값을 AndroidBridge에서 전달받음
    // const safeAreaTop = (window as any).safeAreaTop || 0;
    // const safeAreaBottom = (window as any).safeAreaBottom || 0;
    // if (container) {
    //   container.style.paddingTop = `${safeAreaTop}px`;
    //   container.style.paddingBottom = `${safeAreaBottom}px`;
    // }
    // console.log("Platform: Android WebView");
    // console.log(`SafeArea - Top: ${safeAreaTop}px, Bottom: ${safeAreaBottom}px`);
  } else if (isTossApp()) {
    // Toss 앱: getSafeAreaInsets 사용
    const insets = getSafeAreaInsets();

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

disableLoupe();

await initializeApp();

// React UI 마운트
const uiElement = document.getElementById("ui");
if (uiElement) {
  const root = createRoot(uiElement);
  root.render(React.createElement(GameUI));
}

export const game = new Game().init();
