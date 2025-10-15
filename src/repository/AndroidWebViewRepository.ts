import type { IScoreRepository } from "./IScoreRepository";

/**
 * 안드로이드 WebView용 Repository
 * AndroidBridge를 통해 SharedPreferences에 데이터 저장
 */
export class AndroidWebViewRepository implements IScoreRepository {
  private readonly BEST_SCORE_KEY = "swipebrick-best-score";
  private readonly GAME_STATE_KEY = "swipebrick-game-state";

  private get bridge() {
    return (window as any).AndroidBridge;
  }

  async getBestScore(): Promise<number> {
    const scoreStr = this.bridge.getData(this.BEST_SCORE_KEY);
    return scoreStr ? parseInt(scoreStr, 10) : 1;
  }

  async setBestScore(score: number): Promise<void> {
    this.bridge.saveData(this.BEST_SCORE_KEY, score.toString());
  }

  async getGameState(): Promise<string | null> {
    const state = this.bridge.getData(this.GAME_STATE_KEY);
    return state || null;
  }

  async setGameState(gameState: string): Promise<void> {
    this.bridge.saveData(this.GAME_STATE_KEY, gameState);
  }
}
