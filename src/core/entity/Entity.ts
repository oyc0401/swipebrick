import type {
  IPhysicsComponent,
  IRenderComponent,
} from "../components/IComponent";

export class Entity { // 모든 게임 오브젝트의 부모
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
