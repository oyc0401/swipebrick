import { Entity } from "../core/entity/Entity";
import { RectangleRenderComponent } from "../render/RenderComponent";
import { BoundaryPhysicsComponent } from "../physics/PhysicsComponent";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import type { Graphics } from "pixi.js";

export class GameBoundary extends Entity {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number = 0x000000,
    label?: string
  ) {
    super(`boundary-${Date.now()}-${Math.random()}`);

    // 시각적으로는 기존 크기 유지 (5px)
    this.renderComponent = new RectangleRenderComponent(width, height, color);
    this.renderComponent.updatePosition(x, y);

    // 물리 충돌체는 매우 두껍게 (100px)
    const thickWallSize = 100;

    let physicsX = x;
    let physicsY = y;
    let physicsWidth = width;
    let physicsHeight = height;

    // 벽 위치에 따라 물리 충돌체를 바깥쪽으로 확장
    if (width > height) {
      // 가로벽 (상단/하단)
      physicsHeight = thickWallSize;
      if (y <= 10) {
        // 상단벽 - 위쪽으로 확장
        physicsY = y - (thickWallSize - height);
      }
      // 하단벽은 그대로 (아래쪽으로 확장)
    } else {
      // 세로벽 (좌측/우측)
      physicsWidth = thickWallSize;
      if (x <= 10) {
        // 좌측벽 - 왼쪽으로 확장
        physicsX = x - (thickWallSize - width);
      }
      // 우측벽은 그대로 (오른쪽으로 확장)
    }

    this.physicsComponent = new BoundaryPhysicsComponent(
      physicsX,
      physicsY,
      physicsWidth,
      physicsHeight,
      label || "boundary"
    );
  }

  public getGraphics(): Graphics {
    return this.renderComponent.getGraphics();
  }

  public getPhysicsBody(): Matter.Body {
    return this.physicsComponent.getBody();
  }

  public destroy(): void {
    // PhysicsEngine에서 바디 제거
    PhysicsEngine.getInstance().removeBody(this.getPhysicsBody());

    super.destroy();
  }
}
