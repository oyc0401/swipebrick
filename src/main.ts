import * as PIXI from "pixi.js";
import { GameState } from "./GameState";
import { Ball } from "./Ball";
import { GameBoundary } from "./GameBoundary";

const GAME_WIDTH = 360;
const GAME_HEIGHT = 450;

class Game {
  private app!: PIXI.Application;
  private gameState: GameState;
  private ball: Ball;
  private topBoundary!: GameBoundary;
  private bottomBoundary!: GameBoundary;

  constructor() {
    this.gameState = new GameState();
    this.ball = new Ball(this.gameState.ballStartPosition);
    this.init();
  }

  private async init(): Promise<void> {
    // PixiJS Application 생성 (1000x2000 좌표계)
    this.app = new PIXI.Application();
    await this.app.init({
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      backgroundColor: 0xffffff,
      antialias: true,
    });

    // HTML 컨테이너에 캔버스 추가
    const container = document.getElementById("container");
    if (container) {
      container.appendChild(this.app.canvas);
    }

    // 반응형 스케일링 설정
    this.setupResponsiveScaling();

    // 리사이즈 이벤트 리스너
    window.addEventListener("resize", () => this.updateScale());

    // 게임 경계선 추가
    this.addGameBoundaries();

    // 공 렌더링
    this.app.stage.addChild(this.ball.getGraphics());

    // 테스트용 그래픽 추가
    this.addTestGraphics();
  }

  private setupResponsiveScaling(): void {
    this.updateScale();
  }

  private updateScale(): void {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // 게임 좌표계 기준 비율
    const gameRatio = GAME_WIDTH / GAME_HEIGHT;
    const windowRatio = windowWidth / windowHeight;

    let scale: number;

    if (windowRatio > gameRatio) {
      // 화면이 게임보다 가로가 길 때 - 세로 기준으로 스케일
      scale = windowHeight / GAME_HEIGHT;
    } else {
      // 화면이 게임보다 세로가 길 때 - 가로 기준으로 스케일
      scale = windowWidth / GAME_WIDTH;
    }

    // 최대 렌더링 크기 제한
    const maxWidth = 400;

    const actualWidth = GAME_WIDTH * scale;

    if (actualWidth > maxWidth) {
      scale = maxWidth / GAME_WIDTH;
    }

    // 캔버스 스케일 적용
    this.app.canvas.style.width = `${GAME_WIDTH * scale}px`;
    this.app.canvas.style.height = `${GAME_HEIGHT * scale}px`;
  }

  private addGameBoundaries(): void {
    // 상단 경계선 (40px 아래, 5px 두께)
    this.topBoundary = new GameBoundary(0, 40, GAME_WIDTH, 5);
    this.app.stage.addChild(this.topBoundary.getGraphics());

    // 하단 경계선 (40px 위, 5px 두께)
    const bottomY = GAME_HEIGHT - 40 - 5;
    this.bottomBoundary = new GameBoundary(0, bottomY, GAME_WIDTH, 5);
    this.app.stage.addChild(this.bottomBoundary.getGraphics());
  }

  private addTestGraphics(): void {
    // 테스트용: 경계선 그리기
    const graphics = new PIXI.Graphics();

    // 외곽선
    graphics.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    graphics.stroke({ width: 4, color: 0x00ff00 });

    // 중앙 십자선
    graphics.moveTo(GAME_WIDTH / 2, 0);
    graphics.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
    graphics.moveTo(0, GAME_HEIGHT / 2);
    graphics.lineTo(GAME_WIDTH, GAME_HEIGHT / 2);
    graphics.stroke({ width: 2, color: 0xff0000 });

    this.app.stage.addChild(graphics);
  }
}

// 게임 시작
new Game();
