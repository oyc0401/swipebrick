import type { IScoreRepository } from "./IScoreRepository";
import { Storage } from "@apps-in-toss/web-framework";

export class TossAppScoreRepository implements IScoreRepository {
  private readonly BEST_SCORE_KEY = "swipebrick-best-score";
  private cachedBestScore: number | null = null;

  async getBestScore(): Promise<number> {
    if (this.cachedBestScore !== null) {
      return this.cachedBestScore;
    }

    try {
      const storedScore = await Storage.getItem(this.BEST_SCORE_KEY);
      this.cachedBestScore = storedScore ? parseInt(storedScore, 10) : 1;
      return this.cachedBestScore;
    } catch (e) {
      console.warn("Toss storage not available, using default score");
      this.cachedBestScore = 1;
      return this.cachedBestScore;
    }
  }

  async setBestScore(score: number): Promise<void> {
    try {
      await Storage.setItem(this.BEST_SCORE_KEY, score.toString());
      this.cachedBestScore = score;
    } catch (e) {
      console.warn("Toss storage not available, score not saved");
    }
  }
}
