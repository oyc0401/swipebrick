import { isTossApp } from "./platform";
import { getLocale as getLocaleFromToss } from "@apps-in-toss/web-framework";

// 웹 환경에서 locale 감지
function getWebLocale(): string {
  // 1. navigator.language 사용 (가장 정확)
  if (navigator.language) {
    return navigator.language;
  }

  // 2. navigator.languages 배열의 첫 번째 요소
  if (navigator.languages && navigator.languages.length > 0) {
    return navigator.languages[0];
  }

  // 3. 구형 브라우저 대응
  const legacyLocale =
    (navigator as any).userLanguage ||
    (navigator as any).browserLanguage ||
    (navigator as any).systemLanguage;

  if (legacyLocale) {
    return legacyLocale;
  }

  // 4. 기본값
  return "ko-KR";
}

export function getLocale(): string {
  if (isTossApp()) {
    if (getLocaleFromToss) {
      return getLocaleFromToss();
    }
    // 토스 프레임워크 로드 실패 시 웹 방식으로 fallback
    console.warn("Toss getLocale not available, falling back to web detection");
  }

  // 웹 환경 또는 토스 fallback
  return getWebLocale();
}

// 동기 버전 (이미 초기화된 경우에만 사용)
export function getLocaleSync(): string {
  if (isTossApp() && getLocaleFromToss) {
    return getLocaleFromToss();
  }
  return getWebLocale();
}

// 언어 코드만 추출 (ko-KR -> ko)
export async function getLanguageCode(): Promise<string> {
  const locale = await getLocale();
  return locale.split("-")[0];
}
