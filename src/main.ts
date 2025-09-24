import * as PIXI from "pixi.js";
import * as Matter from "matter-js";
import { GameState } from "./GameState";
import { Ball } from "./Ball";
import { GameBoundary } from "./GameBoundary";

const GAME_WIDTH = 360;
const GAME_HEIGHT = 360;

/**
 * 반응형 UI 가로 크기
 */
function getInnerWidth() {
  // -> 세로 / 가로
  const RATIO = 1.8; // 2도 좋음
  let innerWidth = window.innerWidth;
  if (window.innerHeight / window.innerWidth < RATIO) {
    innerWidth = window.innerHeight / RATIO;
  }
  return innerWidth;
}

class Game {
  private app!: PIXI.Application;

  private gameState: GameState;
  private ball: Ball;

  // 레이어
  private centerLayer!: PIXI.Container; // 화면 중앙 고정 (pivot = 180,180)
  private gameViewport!: PIXI.Container; // 360×360 게임 씬(오브젝트)

  // Matter.js 물리 엔진
  private engine!: Matter.Engine;
  private world!: Matter.World;

  private topBoundary!: GameBoundary;
  private bottomBoundary!: GameBoundary;
  private leftBoundary!: GameBoundary;
  private rightBoundary!: GameBoundary;

  constructor() {
    this.gameState = new GameState();
    this.initPhysics();
    this.ball = new Ball(this.gameState.ballStartPosition, this.world);
    this.init();
  }

  private initPhysics(): void {
    // Matter.js 엔진 초기화
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;

    // 중력 비활성화 (수평 이동 게임)
    this.engine.world.gravity.y = 0;
    this.engine.world.gravity.x = 0;
  }

  private async init(): Promise<void> {
    this.app = new PIXI.Application();

    await this.app.init({
      width: getInnerWidth(),
      height: window.innerHeight,
      autoDensity: true,
      backgroundColor: 0xeeeeee,
      antialias: true,
      resolution: Math.ceil(window.devicePixelRatio),
    });

    console.log("dpr:", window.devicePixelRatio);

    const container = document.getElementById("container");
    if (container) container.appendChild(this.app.canvas);
    this.app.canvas.style.display = "block";

    // 중앙 고정 레이어
    this.centerLayer = new PIXI.Container();
    this.centerLayer.pivot.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.app.stage.addChild(this.centerLayer);

    // 게임 뷰포트
    this.gameViewport = new PIXI.Container();
    this.gameViewport.hitArea = new PIXI.Rectangle(
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT
    );
    this.centerLayer.addChild(this.gameViewport);

    // 중앙 정렬 & 리사이즈 대응
    this.updateCenterPosition();
    window.addEventListener("resize", () => this.onResize());

    // 게임 오브젝트(경계선/공 등)는 흰 박스 위에 올라감
    this.addGameBoundaries();
    this.gameViewport.addChild(this.ball.getGraphics());

    // 클릭 이벤트 추가
    this.addClickListener();

    // 게임 루프 시작
    this.startGameLoop();

    // 디버그 가이드(원하시면 주석 해제)
    this.addDebugGuide();
  }

  private onResize() {
    const w = getInnerWidth();
    const h = window.innerHeight;
    this.app.renderer.resize(w, h);
    this.updateCenterPosition();
  }

  private updateCenterPosition() {
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;

    // 화면 가로 크기에 맞춰 스케일 계산
    const scale = Math.min(
      screenWidth / GAME_WIDTH,
      screenHeight / GAME_HEIGHT
    );

    // centerLayer에 스케일 적용
    this.centerLayer.scale.set(scale);

    // 화면 중앙에 배치
    this.centerLayer.position.set(screenWidth / 2, screenHeight / 2);
  }

  private addGameBoundaries(): void {
    // 사각형 위쪽에 경계선 (y: -5)
    this.topBoundary = new GameBoundary(
      0,
      -5,
      GAME_WIDTH,
      5,
      0x000000,
      this.world
    );
    this.centerLayer.addChild(this.topBoundary.getGraphics());

    // 사각형 아래쪽에 경계선 (y: 360)
    this.bottomBoundary = new GameBoundary(
      0,
      GAME_HEIGHT,
      GAME_WIDTH,
      5,
      0x000000,
      this.world
    );
    this.centerLayer.addChild(this.bottomBoundary.getGraphics());

    // 왼쪽 벽
    this.leftBoundary = new GameBoundary(
      -5,
      0,
      5,
      GAME_HEIGHT,
      0x000000,
      this.world
    );
    this.centerLayer.addChild(this.leftBoundary.getGraphics());

    // 오른쪽 벽
    this.rightBoundary = new GameBoundary(
      GAME_WIDTH,
      0,
      5,
      GAME_HEIGHT,
      0x000000,
      this.world
    );
    this.centerLayer.addChild(this.rightBoundary.getGraphics());
  }

  private addClickListener(): void {
    this.gameViewport.eventMode = "static";
    this.gameViewport.on("pointerdown", (event: PIXI.FederatedPointerEvent) => {
      const localPosition = event.getLocalPosition(this.gameViewport);
      console.log("Clicked at:", localPosition.x, localPosition.y);
      this.ball.moveTowards(localPosition.x, localPosition.y);
    });
  }

  private startGameLoop(): void {
    this.app.ticker.add(() => {
      // Matter.js 물리 시뮬레이션 업데이트
      Matter.Engine.update(this.engine, 16); // 60fps

      // 공 위치 동기화
      this.ball.updateGraphics();
    });
  }

  private addDebugGuide() {
    const g = new PIXI.Graphics();
    g.rect(0, 0, GAME_WIDTH, GAME_HEIGHT).stroke({ width: 2, color: 0x00aa00 });
    g.moveTo(GAME_WIDTH / 2, 0).lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
    g.moveTo(0, GAME_HEIGHT / 2).lineTo(GAME_WIDTH, GAME_HEIGHT / 2);
    g.stroke({ width: 1, color: 0xaa0000 });
    this.centerLayer.addChild(g);
  }
}

new Game();
