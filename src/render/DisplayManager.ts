import { Application, Container, Graphics, Rectangle } from "pixi.js";
import { activeEntities } from "../core/entity/ActiveEntity";

/**
 * 반응형 UI 가로 크기
 */
function getSize() {
  const size = { width: window.innerWidth, height: window.innerHeight };
  // -> 세로 / 가로
  const RATIO = 1.8; // 2도 좋음
  let innerWidth = size.width;
  if (size.height / size.width < RATIO) {
    innerWidth = size.height / RATIO;
  }
  return {
    width: innerWidth,
    height: size.height,
  };
}

export class DisplayManager {
  private app: Application;
  private centerLayer: Container;
  private gameViewport: Container;
  private gameWidth: number;
  private gameHeight: number;

  constructor(gameWidth: number, gameHeight: number) {
    this.app = new Application();
    this.centerLayer = new Container(); // 캔버스 전체영역.
    this.gameViewport = new Container(); // 게임영역 내부 화면
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
  }

  public async init(): Promise<void> {
    let { width, height } = getSize();
    await this.app.init({
      width,
      height,
      autoDensity: true,
      backgroundColor: 0xeeeeee,
      antialias: true,
      resolution: Math.ceil(window.devicePixelRatio),
    });

    console.log("dpr:", window.devicePixelRatio);

    const container = document.getElementById("container");
    if (container) container.appendChild(this.app.canvas);
    this.app.canvas.style.display = "block";

    this.setupLayers();
    this.setupEventListeners();
  }

  private setupLayers(): void {
    // 중앙 고정 레이어
    this.centerLayer.pivot.set(this.gameWidth / 2, this.gameWidth / 2);

    this.app.stage.addChild(this.centerLayer);

    // // 게임 뷰포트
    // this.centerLayer.hitArea = new Rectangle(0, -200, this.gameWidth, 800);
    this.gameViewport.hitArea = new Rectangle(
      0,
      0,
      this.gameWidth,
      this.gameHeight
    );
    this.centerLayer.addChild(this.gameViewport);

    // // 중앙 정렬 & 리사이즈 대응
    this.updateCenterPosition();
  }

  private setupEventListeners(): void {
    window.addEventListener("resize", () => this.onResize());
  }

  private onResize(): void {
    let { width, height } = getSize();
    this.app.renderer.resize(width, height);
    this.updateCenterPosition();
  }

  private updateCenterPosition(): void {
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;

    // 화면 가로 크기에 맞춰 스케일 계산
    const scale = Math.min(
      screenWidth / this.gameWidth,
      screenHeight / this.gameHeight
    );

    // centerLayer에 스케일 적용
    this.centerLayer.scale.set(scale);

    // 화면 중앙에 배치
    this.centerLayer.position.set(screenWidth / 2, screenHeight / 2);

    this.drawBackground(scale);
  }

  private drawBackground(scale: number) {
    let canvasSize = getSize();
    // 배경 추가
    let scaledCanvasHeight = canvasSize.height / scale;
    let h = (this.gameHeight - scaledCanvasHeight) / 2;

    const background = new Graphics();
    background.rect(0, h, this.gameWidth, scaledCanvasHeight).fill(0xececec); // 하늘색
    this.centerLayer.addChildAt(background, 0);
  }

  public addDebugGuide(): void {
    const g = new Graphics();
    g.rect(0, 0, this.gameWidth, this.gameHeight).stroke({
      width: 2,
      color: 0x00aa00,
    });
    g.moveTo(this.gameWidth / 2, 0).lineTo(this.gameWidth / 2, this.gameHeight);
    g.moveTo(0, this.gameHeight / 2).lineTo(
      this.gameWidth,
      this.gameHeight / 2
    );
    g.stroke({ width: 1, color: 0xaa0000 });
    this.centerLayer.addChild(g);
  }

  public getCenterLayer(): Container {
    return this.centerLayer;
  }

  public getGameViewport(): Container {
    return this.gameViewport;
  }

  public getApp(): Application {
    return this.app;
  }

  public startLoop(): void {
    const renderLoop = () => {
      // 모든 MovingEntity 업데이트
      activeEntities.forEach((entity) => {
        entity.updateGraphics();
      });

      requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }
}
