import { PhysicsComponent } from "../../physics/PhysicsComponent";
import { RenderComponent } from "../../render/RenderComponent";

export class Entity {
  public readonly id: string;
  public physicsComponent!: PhysicsComponent;
  public renderComponent!: RenderComponent;

  constructor(id: string) {
    this.id = id;
  }

  public destroy(): void {
    if (this.renderComponent) {
      this.renderComponent.destroy();
    }
  }
}
