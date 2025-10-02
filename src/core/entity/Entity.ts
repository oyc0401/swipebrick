import type {
  IPhysicsComponent,
  IRenderComponent,
} from "../components/IComponent";

export class Entity {
  public readonly id: string;
  private _physicsComponent?: IPhysicsComponent;
  private _renderComponent?: IRenderComponent;

  constructor(id: string) {
    this.id = id;
  }

  public get physicsComponent(): IPhysicsComponent {
    if (!this._physicsComponent) {
      throw new Error(`PhysicsComponent not initialized for entity: ${this.id}`);
    }
    return this._physicsComponent;
  }

  public set physicsComponent(component: IPhysicsComponent) {
    this._physicsComponent = component;
  }

  public get renderComponent(): IRenderComponent {
    if (!this._renderComponent) {
      throw new Error(`RenderComponent not initialized for entity: ${this.id}`);
    }
    return this._renderComponent;
  }

  public set renderComponent(component: IRenderComponent) {
    this._renderComponent = component;
  }

  public destroy(): void {
    // 렌더 컴포넌트 먼저 파괴 (화면에서 제거)
    if (this._renderComponent) {
      this._renderComponent.destroy();
      this._renderComponent = undefined;
    }
    // 물리 컴포넌트 나중에 파괴 (물리 월드에서 제거)
    if (this._physicsComponent) {
      this._physicsComponent.destroy();
      this._physicsComponent = undefined;
    }
  }
}
