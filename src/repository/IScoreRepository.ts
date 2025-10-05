export interface IScoreRepository {
  getBestScore(): Promise<number>;
  setBestScore(score: number): Promise<void>;
  getGameState(): Promise<string | null>;
  setGameState(gameState: string): Promise<void>;
}