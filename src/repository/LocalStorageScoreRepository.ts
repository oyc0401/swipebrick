import type { IScoreRepository } from "./IScoreRepository";

export class LocalStorageScoreRepository implements IScoreRepository {
  private readonly BEST_SCORE_KEY = "swipebrick-best-score";
  private readonly GAME_STATE_KEY = "swipebrick-game-state";

  async getBestScore(): Promise<number> {
    const storedScore = localStorage.getItem(this.BEST_SCORE_KEY);
    return storedScore ? parseInt(storedScore, 10) : 1;
  }

  async setBestScore(score: number): Promise<void> {
    localStorage.setItem(this.BEST_SCORE_KEY, score.toString());
  }

  async getGameState(): Promise<string | null> {
    return localStorage.getItem(this.GAME_STATE_KEY);
  }

  async setGameState(gameState: string): Promise<void> {
    localStorage.setItem(this.GAME_STATE_KEY, gameState);
  }
}
