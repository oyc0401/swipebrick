import { Engine, World, Events, Body, Sleeping } from "matter-js";

export class PhysicsEngine {
  private engine: Engine;
  private world: World;

  constructor() {
    this.engine = Engine.create();
    this.world = this.engine.world;

    // 중력 비활성화 (수평 이동 게임)
    this.engine.gravity.y = 0;
    this.engine.gravity.x = 0;

    this.setupCollisionEvents();
  }

  private setupCollisionEvents(): void {
    Events.on(this.engine, "collisionStart", (event) => {
      const pairs = event.pairs;

      for (let pair of pairs) {
        const { bodyA, bodyB } = pair;

        // 바닥과 공의 충돌 확인
        const isBallBottomCollision =
          (bodyA.label === "ball" && bodyB.label === "bottom") ||
          (bodyB.label === "ball" && bodyA.label === "bottom");

        if (isBallBottomCollision) {
          const ballBody = bodyA.label === "ball" ? bodyA : bodyB;
          // 바닥에 충돌했을 때만 탄성을 0으로 변경
          ballBody.restitution = 0;

          // 공을 바닥에 딱 붙여서 위치 조정 (공의 반지름 8을 고려)
          const ballRadius = 8;
          const bottomY = 360; // 바닥의 상단 위치
          Body.setPosition(ballBody, {
            x: ballBody.position.x,
            y: bottomY - ballRadius, // 352 (바닥에서 공 반지름만큼 위)
          });

          // 공을 완전히 멈춤
          Body.setVelocity(ballBody, { x: 0, y: 0 });
          Body.setAngularVelocity(ballBody, 0);

          // 공의 높이 확인
          console.log("Ball position after stop:", ballBody.position.y);

          // 추가 안전장치: 공을 정지 상태로 만들기
          Sleeping.set(ballBody, true);
        }
      }
    });
  }

  public update(deltaTime: number = 16): void {
    Engine.update(this.engine, deltaTime);
  }

  public getWorld(): World {
    return this.world;
  }

  public getEngine(): Engine {
    return this.engine;
  }
}
