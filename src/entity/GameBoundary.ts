import { Entity } from "./Entity";
import { RectangleRenderComponent } from "../render/RenderComponent";
import { BoundaryPhysicsComponent } from "../physics/PhysicsComponent";

export class GameBoundary extends Entity {
  private isDestroyed: boolean = false;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number = 0x000000,
    world?: any,
    label?: string
  ) {
    super(`boundary-${Date.now()}-${Math.random()}`);

    // 컴포넌트 직접 할당
    this.renderComponent = new RectangleRenderComponent(width, height, color);
    this.renderComponent.updatePosition(x, y); // 사각형은 좌상단 기준

    if (world) {
      this.physicsComponent = new BoundaryPhysicsComponent(
        world,
        x,
        y,
        width,
        height,
        label || "boundary"
      );
    }
  }

  public getGraphics(): any {
    return this.renderComponent.getGraphics();
  }

  public destroy(): void {
    if (!this.isDestroyed) {
      this.isDestroyed = true;
      super.destroy();
    }
  }

  public playDestroyAnimation(): Promise<void> {
    return new Promise((resolve) => {
      // 나중에 부서지는 애니메이션 구현
      // 지금은 즉시 제거
      this.destroy();
      resolve();
    });
  }

  public isVisible(): boolean {
    return !this.isDestroyed;
  }
}
