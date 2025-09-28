import type {
  IPhysicsComponent,
  IRenderComponent,
} from "../components/IComponent";

export class Entity {
  public readonly id: string;
  public physicsComponent!: IPhysicsComponent;
  public renderComponent!: IRenderComponent;

  constructor(id: string) {
    this.id = id;
  }

  public destroy(): void {
    if (this.renderComponent) {
      this.renderComponent.destroy();
    }
    if (this.physicsComponent) {
      this.physicsComponent.destroy();
    }
  }
}
