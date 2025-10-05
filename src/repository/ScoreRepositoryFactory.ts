import type { IScoreRepository } from "./IScoreRepository";
import { LocalStorageScoreRepository } from "./LocalStorageScoreRepository";
import { TossAppScoreRepository } from "./TossAppScoreRepository";
import { isTossApp } from "../utils/platform";

export class ScoreRepositoryFactory {
  static create(): IScoreRepository {
    if (isTossApp()) {
      return new TossAppScoreRepository();
    } else {
      return new LocalStorageScoreRepository();
    }
  }
}
