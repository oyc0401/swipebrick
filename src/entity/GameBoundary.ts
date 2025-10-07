import { Entity } from "../core/entity/Entity";
import { RectangleRenderComponent } from "../render/RenderComponent";
import { BoundaryPhysicsComponent } from "../physics/PhysicsComponent";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import type { Container } from "pixi.js";

export class GameBoundary extends Entity {
  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    label: string
  ) {
    super(id);

    this.renderComponent = new RectangleRenderComponent(width, height, color);
    this.renderComponent.setPosition(x, y);

    this.physicsComponent = new BoundaryPhysicsComponent(
      x,
      y,
      width,
      height,
      this.id,
      label
    );
  }

  public getGraphics(): Container {
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
