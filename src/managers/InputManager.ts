import type { Container, FederatedPointerEvent } from "pixi.js";

interface ClickCallback {
  (x: number, y: number): void;
}

export class InputManager {
  private layer: Container;
  private onGameClick?: ClickCallback;

  constructor(gameViewport: Container) {
    this.layer = gameViewport;
    this.setupClickListener();
  }

  /** 게임 영역 클릭 시 이벤트 */
  public onClick(callback: ClickCallback): void {
    this.onGameClick = callback;
  }

  private setupClickListener(): void {
    this.layer.eventMode = "static";
    this.layer.on("pointerdown", (event: FederatedPointerEvent) => {
      const localPosition = event.getLocalPosition(this.layer);
      console.log("Clicked at:", localPosition.x, localPosition.y);

      if (this.onGameClick) {
        this.onGameClick(localPosition.x, localPosition.y);
      }
    });
  }

  public destroy(): void {
    this.layer.off("pointerdown");
    this.onGameClick = undefined;
  }
}
