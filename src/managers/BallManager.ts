import type { Container } from "pixi.js";
import { World } from "matter-js";
import { Ball } from "../entity/Ball";
import type { Position } from "../GameState";
import type { PhysicsEngine } from "../physics/PhysicsEngine";

interface BallLandingCallback {
  (landedBall: Ball): void;
}

interface AllBallsRemovedCallback {
  (): void;
}

export class BallManager {
  private activeBalls: Ball[] = [];
  private previewBall!: Ball;
  private gameViewport: Container;
  private physicsWorld: any;
  private ballStartPosition: Position = { x: 180, y: 50 };

  private onBallLanding?: BallLandingCallback;
  private onAllBallsRemoved?: AllBallsRemovedCallback;

  constructor(
    gameViewport: Container,
    physics: PhysicsEngine,
    initialBallPosition?: Position
  ) {
    this.gameViewport = gameViewport;
    this.physicsWorld = physics.getWorld();
    if (initialBallPosition) {
      this.ballStartPosition = initialBallPosition;
    }
    this.createPreviewBall();
  }

  /** 첫번째 공이 도착했을 때 이벤트 */
  public onFirstBallLanded(callback: BallLandingCallback): void {
    this.onBallLanding = callback;
  }

  /** 모든 공이 도착했을 때 이벤트 */
  public onAllBallsFinished(callback: AllBallsRemovedCallback): void {
    this.onAllBallsRemoved = callback;
  }

  public createBalls(count: number): void {
    for (let i = 0; i < count; i++) {
      const ball = new Ball(this.ballStartPosition);
      World.add(this.physicsWorld, ball.getPhysicsBody());
      this.gameViewport.addChild(ball.getGraphics());
      this.activeBalls.push(ball);
    }
  }

  public launchBalls(targetX: number, targetY: number, delayMs: number = 100): void {
    this.activeBalls.forEach((ball, index) => {
      setTimeout(() => {
        ball.moveTowards(targetX, targetY);
      }, index * delayMs);
    });
  }

  public handleBallLanding(ballBody: any): void {
    const landedBall = this.activeBalls.find(
      (ball) => ball.getPhysicsBody() === ballBody
    );

    if (!landedBall) return;

    if (this.onBallLanding) {
      this.onBallLanding(landedBall);
    }

    this.removeBall(landedBall);
    this.checkAllBallsRemoved();
  }

  public setBallStartPosition(x: number, y: number): void {
    this.ballStartPosition = { x, y };
    this.updatePreviewBallPosition();
  }

  public showPreviewBall(): void {
    this.previewBall.getGraphics().visible = true;
    this.updatePreviewBallPosition();
  }

  public hidePreviewBall(): void {
    this.previewBall.getGraphics().visible = false;
  }

  public getActiveBallCount(): number {
    return this.activeBalls.length;
  }

  public hasActiveBalls(): boolean {
    return this.activeBalls.length > 0;
  }

  public getBallStartPosition(): Position {
    return { ...this.ballStartPosition };
  }

  private createPreviewBall(): void {
    this.previewBall = new Ball(this.ballStartPosition);
    this.gameViewport.addChild(this.previewBall.getGraphics());
  }

  private updatePreviewBallPosition(): void {
    this.previewBall.setPosition(this.ballStartPosition);
  }

  private removeBall(ball: Ball): void {
    this.gameViewport.removeChild(ball.getGraphics());
    World.remove(this.physicsWorld, ball.getPhysicsBody());
    ball.destroy();

    const index = this.activeBalls.indexOf(ball);
    if (index > -1) {
      this.activeBalls.splice(index, 1);
    }
  }

  private checkAllBallsRemoved(): void {
    if (this.activeBalls.length === 0 && this.onAllBallsRemoved) {
      setTimeout(() => {
        if (this.onAllBallsRemoved) {
          this.onAllBallsRemoved();
        }
      }, 100);
    }
  }

  public destroy(): void {
    this.activeBalls.forEach(ball => {
      this.removeBall(ball);
    });

    if (this.previewBall) {
      this.gameViewport.removeChild(this.previewBall.getGraphics());
      this.previewBall.destroy();
    }

    this.activeBalls = [];
  }
}