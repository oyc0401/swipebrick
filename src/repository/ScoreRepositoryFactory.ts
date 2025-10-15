import type { IScoreRepository } from "./IScoreRepository";
import { LocalStorageScoreRepository } from "./LocalStorageScoreRepository";
import { TossAppScoreRepository } from "./TossAppScoreRepository";
import { AndroidWebViewRepository } from "./AndroidWebViewRepository";
import { isTossApp } from "../utils/platform";

export class ScoreRepositoryFactory {
  static create(): IScoreRepository {
    // 1. 안드로이드 WebView 확인
    if (typeof (window as any).AndroidBridge !== "undefined") {
      return new AndroidWebViewRepository();
    }

    // 2. Toss 앱 확인
    if (isTossApp()) {
      return new TossAppScoreRepository();
    }

    // 3. 일반 웹 브라우저 (localStorage)
    return new LocalStorageScoreRepository();
  }
}
