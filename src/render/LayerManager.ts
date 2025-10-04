import { Container, Graphics, Rectangle } from "pixi.js";
import type { Application } from "pixi.js";

/**
 * 반응형 UI 가로 크기
 */
function getSize() {
  const containerElement = document.getElementById("container");
  const containerRect = containerElement?.getBoundingClientRect();

  return {
    width: containerRect?.width ?? 0,
    height: containerRect?.height ?? 0,
  };
}

export class LayerManager {
  private app: Application;
  private centerLayer: Container;
  private gameViewport: Container;
  private gameWidth: number;
  private gameHeight: number;
  private background: Graphics | null = null;
  private cleanupTasks: (() => void)[] = [];

  constructor(app: Application, gameWidth: number, gameHeight: number) {
    this.app = app;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.centerLayer = new Container();
    this.gameViewport = new Container();
  }

  public setupLayers(stage: Container): void {
    // 중앙 고정 레이어
    this.centerLayer.pivot.set(this.gameWidth / 2, this.gameWidth / 2);

    stage.addChild(this.centerLayer);

    // 게임 뷰포트
    this.gameViewport.hitArea = new Rectangle(
      0,
      0,
      this.gameWidth,
      this.gameHeight
    );
    this.centerLayer.addChild(this.gameViewport);

    // 리사이즈 이벤트 리스너 설정
    this.setupEventListeners();

    // 중앙 정렬 & 리사이즈 대응
    this.updateCenterPosition();
  }

  public setupEventListeners(): void {
    window.addEventListener("resize", this.onResize);
    this.cleanupTasks.push(() =>
      window.removeEventListener("resize", this.onResize)
    );
  }

  private onResize = (): void => {
    const { width, height } = getSize();
    this.app.renderer.resize(width, height);
    this.updateCenterPosition();
  };

  public updateCenterPosition(): void {
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

  private drawBackground(scale: number): void {
    const canvasSize = getSize();
    const scaledCanvasHeight = canvasSize.height / scale;
    const h = (this.gameHeight - scaledCanvasHeight) / 2;

    if (!this.background) {
      // 최초 생성
      this.background = new Graphics();
      this.centerLayer.addChildAt(this.background, 0);
    }

    // 기존 Graphics 재활용 (clear 후 새로 그리기)
    this.background.clear();
    this.background
      .rect(0, h, this.gameWidth, scaledCanvasHeight)
      .fill(0xffffff); // 흰색
  }

  public getCenterLayer(): Container {
    return this.centerLayer;
  }

  public getGameViewport(): Container {
    return this.gameViewport;
  }

  public addDebugGuide(): void {
    const debugGuide = new Graphics();
    this.centerLayer.addChild(debugGuide);

    debugGuide.clear();
    debugGuide.rect(0, 0, this.gameWidth, this.gameHeight).stroke({
      width: 2,
      color: 0x00aa00,
    });
    debugGuide
      .moveTo(this.gameWidth / 2, 0)
      .lineTo(this.gameWidth / 2, this.gameHeight);
    debugGuide
      .moveTo(0, this.gameHeight / 2)
      .lineTo(this.gameWidth, this.gameHeight / 2);
    debugGuide.stroke({ width: 1, color: 0xaa0000 });
  }

  public destroy(): void {
    // 이벤트 리스너 정리
    this.cleanupTasks.forEach((cleanup) => cleanup());
    this.cleanupTasks = [];

    // Graphics 객체들 정리
    if (this.background) {
      this.background.destroy(true);
      this.background = null;
    }

    // Container들 정리
    if (this.gameViewport) {
      this.gameViewport.destroy(true);
    }

    if (this.centerLayer) {
      this.centerLayer.destroy(true);
    }
  }
}
