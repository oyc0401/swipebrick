import { Engine, World, Events, Body, Sleeping, Runner } from "matter-js";

import Matter from "matter-js";
import { BALL_RADIUS, GAME_HEIGHT } from "../GameState";
// 벽에 붙는 현상 제거 - Matter.js 내부 속성 접근을 위한 의도적 타입 우회
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Matter.Resolver as any)._restingThresh = 0; // 기본 2 → 0

export class PhysicsEngine {
  private static instance: PhysicsEngine | null = null;

  private engine: Engine;
  private world: World;
  private brickCollisionCallbacks: Array<(brickBody: Matter.Body) => void> = [];
  private bottomCollisionCallbacks: Array<(ballBody: Matter.Body) => void> = [];

  private constructor() {
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

    this.setupBeforeUpdateEvents();
    this.setupCollisionEvents();
    this.setupAfterUpdateEvents();
  }

  public static getInstance(): PhysicsEngine {
    if (!PhysicsEngine.instance) {
      PhysicsEngine.instance = new PhysicsEngine();
    }
    return PhysicsEngine.instance;
  }

  public static destroy(): void {
    if (PhysicsEngine.instance) {
      PhysicsEngine.instance.destroy();
      PhysicsEngine.instance = null;
    }
  }

  private setupBeforeUpdateEvents(): void {
    Events.on(this.engine, "beforeUpdate", () => {
      // 모든 공들의 이전 속도 저장
      for (const body of this.world.bodies) {
        if (body.label === "ball") {
          // Ball 엔티티의 previousVelocity 업데이트
          (body as any).previousVelocity = {
            x: body.velocity.x,
            y: body.velocity.y,
          };
        }
      }
    });
  }

  private setupCollisionEvents(): void {
    Events.on(this.engine, "collisionStart", (event) => {
      const pairs = event.pairs;
      const ballCollisions = new Map<Matter.Body, Matter.Body[]>();

      // 충돌 페어 처리 및 그룹화
      for (let pair of pairs) {
        const { bodyA, bodyB } = pair;

        // 바닥 충돌 처리
        this.handleBottomCollision(bodyA, bodyB);

        // 공별 충돌 그룹화
        this.groupBallCollisions(bodyA, bodyB, ballCollisions);
      }

      // 벽돌 충돌 처리
      this.processBrickCollisions(ballCollisions);
    });
  }

  private handleBottomCollision(bodyA: Matter.Body, bodyB: Matter.Body): void {
    const isBallBottomCollision =
      (bodyA.label === "ball" && bodyB.label === "bottom") ||
      (bodyB.label === "ball" && bodyA.label === "bottom");

    if (!isBallBottomCollision) return;

    const ballBody = bodyA.label === "ball" ? bodyA : bodyB;

    // 공을 바닥에 딱 붙여서 위치 조정
    const ballRadius = BALL_RADIUS;
    const bottomY = GAME_HEIGHT;
    Body.setPosition(ballBody, {
      x: ballBody.position.x,
      y: bottomY - ballRadius,
    });

    // 공을 완전히 멈춤
    Body.setVelocity(ballBody, { x: 0, y: 0 });
    Body.setAngularVelocity(ballBody, 0);
    Sleeping.set(ballBody, true);

    // 바닥 충돌 콜백 호출
    this.bottomCollisionCallbacks.forEach((callback) => {
      callback(ballBody);
    });
  }

  private groupBallCollisions(
    bodyA: Matter.Body,
    bodyB: Matter.Body,
    ballCollisions: Map<Matter.Body, Matter.Body[]>
  ): void {
    const ballBody =
      bodyA.label === "ball" ? bodyA : bodyB.label === "ball" ? bodyB : null;
    const otherBody =
      bodyA.label === "ball" ? bodyB : bodyB.label === "ball" ? bodyA : null;

    if (ballBody && otherBody) {
      if (!ballCollisions.has(ballBody)) {
        ballCollisions.set(ballBody, []);
      }
      ballCollisions.get(ballBody)!.push(otherBody);
    }
  }

  private processBrickCollisions(
    ballCollisions: Map<Matter.Body, Matter.Body[]>
  ): void {
    ballCollisions.forEach((bodies, ball) => {
      const brickBodies = bodies.filter((body) => body.label === "brick");

      if (brickBodies.length === 0) return;

      console.log("Ball hit bricks!", {
        timestamp: new Date().toISOString(),
        ballId: ball.id,
        ballVelocity: ball.velocity,
        brickCount: brickBodies.length,
        brickIds: brickBodies.map((body) => body.id),
      });

      // 2개 벽돌 동시 충돌 시 특별 처리
      if (brickBodies.length === 2) {
        this.handleDualBrickCollision(ball, brickBodies);
      } else {
        // 일반적인 벽돌 충돌 처리
        brickBodies.forEach((brickBody) => {
          this.brickCollisionCallbacks.forEach((callback) => {
            callback(brickBody);
          });
        });
      }
    });
  }

  private handleDualBrickCollision(
    ball: Matter.Body,
    brickBodies: Matter.Body[]
  ): void {
    const [brick1, brick2] = brickBodies;

    const bothAreBricks =
      brick1.label.startsWith("brick") && brick2.label.startsWith("brick");
    const sameYPosition = Math.abs(brick1.position.y - brick2.position.y) < 1;
    const sameXPosition = Math.abs(brick1.position.x - brick2.position.x) < 1;

    if (bothAreBricks && (sameYPosition || sameXPosition)) {
      // 속도 조작
      const previousVelocity = (ball as any).previousVelocity;
      if (previousVelocity) {
        if (sameYPosition) {
          Body.setVelocity(ball, {
            x: previousVelocity.x,
            y: -previousVelocity.y,
          });
        } else if (sameXPosition) {
          Body.setVelocity(ball, {
            x: -previousVelocity.x,
            y: previousVelocity.y,
          });
        }
      }

      // 가장 가까운 벽돌만 처리
      const ballPos = ball.position;
      const distance1 = Math.sqrt(
        Math.pow(ballPos.x - brick1.position.x, 2) +
          Math.pow(ballPos.y - brick1.position.y, 2)
      );
      const distance2 = Math.sqrt(
        Math.pow(ballPos.x - brick2.position.x, 2) +
          Math.pow(ballPos.y - brick2.position.y, 2)
      );

      const closestBrick = distance1 <= distance2 ? brick1 : brick2;
      this.brickCollisionCallbacks.forEach((callback) => {
        callback(closestBrick);
      });

      console.log("Velocity manipulated and hit closest brick:", {
        previousVelocity,
        newVelocity: ball.velocity,
        sameY: sameYPosition,
        sameX: sameXPosition,
        brick1Distance: distance1,
        brick2Distance: distance2,
        chosenBrick: closestBrick.id,
      });
    } else {
      // 정렬되지 않은 두 벽돌의 경우 모든 벽돌 처리
      brickBodies.forEach((brickBody) => {
        this.brickCollisionCallbacks.forEach((callback) => {
          callback(brickBody);
        });
      });
    }
  }

  private setupAfterUpdateEvents(): void {
    Events.on(this.engine, "afterUpdate", () => {
      // 모든 공들의 각도 후처리
      for (const body of this.world.bodies) {
        if (body.label === "ball" && !body.isSleeping) {
          this.correctBallAngleIfNeeded(body);
        }
      }
    });
  }

  private correctBallAngleIfNeeded(ballBody: Matter.Body): void {
    const velocity = ballBody.velocity;
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

    // 속도가 너무 작으면 각도 보정 안함
    if (speed < 0.1) return;

    // 현재 각도 계산 (도 단위, 0~360)
    let angle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    // 금지 각도 범위 확인
    const isInvalidAngle = this.isInvalidAngle(angle);
    if (!isInvalidAngle) return;

    // 가장 가까운 유효 각도로 보정
    const correctedAngle = this.findNearestValidAngle(angle);
    const correctedAngleRad = correctedAngle * (Math.PI / 180);

    // 보정된 속도 계산 (속도 크기는 유지)
    const newVelocity = {
      x: Math.cos(correctedAngleRad) * speed,
      y: Math.sin(correctedAngleRad) * speed,
    };

    Body.setVelocity(ballBody, newVelocity);

    console.log("Ball angle corrected:", {
      timestamp: new Date().toISOString(),
      ballId: ballBody.id,
      originalAngle: angle.toFixed(2),
      correctedAngle: correctedAngle.toFixed(2),
      originalVelocity: velocity,
      newVelocity,
      speed: speed.toFixed(2),
    });
  }

  private isInvalidAngle(angle: number): boolean {
    // 금지 각도 범위: 350.5°~9.5° (거의 수평 우향), 170.5°~189.5° (거의 수평 좌향)
    const isNearHorizontalRight = angle >= 350.5 || angle <= 9.5;
    const isNearHorizontalLeft = angle >= 170.5 && angle <= 189.5;

    return isNearHorizontalRight || isNearHorizontalLeft;
  }

  private findNearestValidAngle(angle: number): number {
    if (angle >= 350.5 || angle <= 9.5) {
      // 0도 근처 (수평 우향) → 금지 구간 가장자리로 보정
      if (angle >= 350.5) {
        // 350.5~360도 → 350도로
        return 350;
      } else {
        // 0~9.5도 → 10도로
        return 10;
      }
    } else if (angle >= 170.5 && angle <= 189.5) {
      // 180도 근처 (수평 좌향) → 금지 구간 가장자리로 보정
      if (angle <= 180) {
        // 170.5~180도 → 170도로
        return 170;
      } else {
        // 180~189.5도 → 190도로
        return 190;
      }
    }

    // 이미 유효한 각도면 그대로 반환 (9.6도 등은 그대로 둠)
    return angle;
  }

  // 60 프레임 고정
  public startLoop(): void {
    const FIXED_TIMESTEP = 1000 / 60;

    const subStep = 8;
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

  public onCollisionBrick(callback: (brickBody: Matter.Body) => void): void {
    this.brickCollisionCallbacks.push(callback);
  }

  public onCollisionBottom(callback: (ballBody: Matter.Body) => void): void {
    this.bottomCollisionCallbacks.push(callback);
  }

  public destroy(): void {
    // 이벤트 리스너 제거
    Events.off(this.engine, "beforeUpdate");
    Events.off(this.engine, "collisionStart");
    Events.off(this.engine, "afterUpdate");
    this.brickCollisionCallbacks = [];
    this.bottomCollisionCallbacks = [];
  }
}
