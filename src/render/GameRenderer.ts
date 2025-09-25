import * as PIXI from "pixi.js";

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

export class GameRenderer {
  private app: PIXI.Application;
  private centerLayer: PIXI.Container;
  private gameViewport: PIXI.Container;

  constructor() {
    this.app = new PIXI.Application();
    this.centerLayer = new PIXI.Container();
    this.gameViewport = new PIXI.Container();
  }

  public async init(): Promise<void> {
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

    this.setupLayers();
    this.setupEventListeners();
  }

  private setupLayers(): void {
    // 중앙 고정 레이어
    this.centerLayer.pivot.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.app.stage.addChild(this.centerLayer);

    // 게임 뷰포트
    this.gameViewport.hitArea = new PIXI.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.centerLayer.addChild(this.gameViewport);

    // 중앙 정렬 & 리사이즈 대응
    this.updateCenterPosition();
  }

  private setupEventListeners(): void {
    window.addEventListener("resize", () => this.onResize());
  }

  private onResize(): void {
    const w = getInnerWidth();
    const h = window.innerHeight;
    this.app.renderer.resize(w, h);
    this.updateCenterPosition();
  }

  private updateCenterPosition(): void {
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

  public addDebugGuide(): void {
    const g = new PIXI.Graphics();
    g.rect(0, 0, GAME_WIDTH, GAME_HEIGHT).stroke({ width: 2, color: 0x00aa00 });
    g.moveTo(GAME_WIDTH / 2, 0).lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
    g.moveTo(0, GAME_HEIGHT / 2).lineTo(GAME_WIDTH, GAME_HEIGHT / 2);
    g.stroke({ width: 1, color: 0xaa0000 });
    this.centerLayer.addChild(g);
  }

  public getCenterLayer(): PIXI.Container {
    return this.centerLayer;
  }

  public getGameViewport(): PIXI.Container {
    return this.gameViewport;
  }

  public getApp(): PIXI.Application {
    return this.app;
  }
}