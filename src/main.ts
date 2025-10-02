import { Game } from "./Game";

import { getSafeAreaInsets } from "@apps-in-toss/web-framework";

try {
  const insets = getSafeAreaInsets();

  const container = document.getElementById("safe-area-wrap");
  if (container) {
    container.style.paddingTop = `${insets.top}px`;
    container.style.paddingBottom = `${insets.bottom}px`;
  }
} catch (e) {}

export const game = new Game().init();
