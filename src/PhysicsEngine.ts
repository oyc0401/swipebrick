import * as Matter from "matter-js";

export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;

  constructor() {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;

    // 중력 비활성화 (수평 이동 게임)
    this.engine.gravity.y = 0;
    this.engine.gravity.x = 0;
  }

  public update(deltaTime: number = 16): void {
    Matter.Engine.update(this.engine, deltaTime);
  }

  public getWorld(): Matter.World {
    return this.world;
  }

  public getEngine(): Matter.Engine {
    return this.engine;
  }
}