import { Engine, World, Events, Body, Sleeping, Runner } from "matter-js";

import Matter from "matter-js";
import { BALL_RADIUS, GAME_HEIGHT } from "../GameState";
// 벽에 붙는 현상 제거 - Matter.js 내부 속성 접근을 위한 의도적 타입 우회
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Matter.Resolver as any)._restingThresh = 0; // 기본 2 → 0

export class PhysicsEngine {
  private engine: Engine;
  private world: World;
  private collisionCallbacks: Array<
    (bodyA: Matter.Body, bodyB: Matter.Body, pair: Matter.Pair) => void
  > = [];

  constructor() {
    this.engine = Engine.create();
    this.world = this.engine.world;

    // 중력 비활성화 (수평 이동 게임)
    this.engine.gravity.y = 0;
    this.engine.gravity.x = 0;

    // Matter.js 정밀도 최적화
    this.engine.constraintIterations = 6;
    this.engine.positionIterations = 12;
    this.engine.velocityIterations = 2;

    this.engine.timing.timeScale = 1.0; // 정확한 타이밍
    this.engine.enableSleeping = false; // 미세한 움직임 자동 정지 막음

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

          // 공을 바닥에 딱 붙여서 위치 조정 (공의 반지름 8을 고려)
          const ballRadius = BALL_RADIUS;
          const bottomY = GAME_HEIGHT; // 바닥의 상단 위치
          Body.setPosition(ballBody, {
            x: ballBody.position.x,
            y: bottomY - ballRadius, // 352 (바닥에서 공 반지름만큼 위)
          });

          // 공을 완전히 멈춤
          Body.setVelocity(ballBody, { x: 0, y: 0 });
          Body.setAngularVelocity(ballBody, 0);

          // 공의 높이 확인
          // console.log("Ball position after stop:", ballBody.position.y);

          // 추가 안전장치: 공을 정지 상태로 만들기
          Sleeping.set(ballBody, true);
        }

        // 모든 충돌 콜백 호출
        this.collisionCallbacks.forEach((callback) => {
          callback(bodyA, bodyB, pair);
        });
      }
    });
  }

  public update(deltaTime: number, c?: number): void {
    Engine.update(this.engine, deltaTime, c);
  }

  public getWorld(): World {
    return this.world;
  }

  public getEngine(): Engine {
    return this.engine;
  }

  // 60 프레임 고정
  public startLoop(): void {
    const FIXED_TIMESTEP = 1000 / 60;

    const subStep = 16;
    const runner = Runner.create({
      delta: FIXED_TIMESTEP / subStep, // 고정 타임스텝 (ms)
    });
    Runner.run(runner, this.engine);
  }

  public addBody(body: Matter.Body): void {
    World.add(this.world, body);
  }

  public removeBody(body: Matter.Body): void {
    World.remove(this.world, body);
  }

  public onCollision(
    callback: (
      bodyA: Matter.Body,
      bodyB: Matter.Body,
      pair: Matter.Pair
    ) => void
  ): void {
    this.collisionCallbacks.push(callback);
  }

  public destroy(): void {
    // 이벤트 리스너 제거
    Events.off(this.engine, "collisionStart");
    this.collisionCallbacks = [];
  }
}
