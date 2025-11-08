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

  if (isAndroidWebView()) {
    // 안드로이드 WebView: SafeArea 값을 AndroidBridge에서 전달받음
    const safeAreaTop = (window as any).AndroidBridge.getSafeAreaTop() || 0;
    const safeAreaBottom =
      (window as any).AndroidBridge.getSafeAreaBottom() || 0;

    if (container) {
      container.style.paddingTop = `${safeAreaTop}px`;
      container.style.paddingBottom = `${safeAreaBottom}px`;
    }

    console.log("Platform: Android WebView");
    console.log(
      `SafeArea - Top: ${safeAreaTop}px, Bottom: ${safeAreaBottom}px`
    );
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

// // FPS 측정 변수
// let frames = 0;
// let lastFpsUpdateTime = performance.now();

// function dod() {
//   requestAnimationFrame(() => {
//     frames++;
//     const now = performance.now();
//     if (now - lastFpsUpdateTime >= 1000) {
//       const fps = Math.round((frames * 1000) / (now - lastFpsUpdateTime));
//       console.log(`FPS: ${fps}`);
//       frames = 0;
//       lastFpsUpdateTime = now;
//     }
//     dod();
//   });
// }
// dod();

// (() => {
//   const win = window as any;
//   if (win.__rafPatch) return;

//   const nativeRAF = win.requestAnimationFrame.bind(win);
//   const nativeCAF = win.cancelAnimationFrame.bind(win);

//   let enabled = false;
//   let fps = 60;
//   let step = 1000 / fps;
//   let start = performance.now();
//   let nextDue = start + step;
//   let tick = 0;
//   let driverId = 0;
//   let nextId = 1;
//   const pending = new Map<number, FrameRequestCallback>();

//   function drain(t: number) {
//     if (!pending.size) return;
//     const tasks = Array.from(pending.values());
//     pending.clear();
//     for (const cb of tasks) cb(t);
//   }

//   function driver(now: number) {
//     if (!enabled) return;

//     if (now >= nextDue) {
//       tick++;
//       const t = start + tick * step;
//       drain(t);
//       nextDue += step;
//     }

//     driverId = nativeRAF(driver);
//   }

//   function patchedRAF(cb: FrameRequestCallback) {
//     const id = nextId++;
//     pending.set(id, cb);
//     if (!enabled) enable(fps);
//     return id;
//   }

//   function patchedCAF(id: number) {
//     pending.delete(id);
//   }

//   function enable(newFPS: number = 60) {
//     fps = newFPS;
//     step = 1000 / fps;
//     start = performance.now();
//     nextDue = start + step;
//     tick = 0;

//     if (!enabled) {
//       enabled = true;
//       driverId = nativeRAF(driver);
//     }

//     win.requestAnimationFrame = patchedRAF;
//     win.cancelAnimationFrame = patchedCAF;
//   }

//   function disable() {
//     if (!enabled) return;
//     enabled = false;
//     nativeCAF(driverId);
//     driverId = 0;
//     pending.clear();
//     win.requestAnimationFrame = nativeRAF;
//     win.cancelAnimationFrame = nativeCAF;
//   }

//   win.__rafPatch = { enable, disable };
// })();

// // window.__rafPatch.enable(60);
