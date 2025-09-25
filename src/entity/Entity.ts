import { PhysicsComponent } from "../components/PhysicsComponent";
import { RenderComponent } from "../components/RenderComponent";

export class Entity {
  public readonly id: string;
  public physicsComponent!: PhysicsComponent;
  public renderComponent!: RenderComponent;

  constructor(id: string) {
    this.id = id;
  }

  public destroy(): void {
    if (this.physicsComponent) {
      this.physicsComponent.destroy();
    }
    if (this.renderComponent) {
      this.renderComponent.destroy();
    }
  }
}
