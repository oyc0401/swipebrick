export interface IScoreRepository {
  getBestScore(): Promise<number>;
  setBestScore(score: number): Promise<void>;
}