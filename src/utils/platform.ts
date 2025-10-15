let cachedPlatformResult: boolean | null = null;

export function isTossApp(): boolean {
  if (cachedPlatformResult !== null) {
    return cachedPlatformResult;
  }

  try {
    // 1. 웹뷰 환경 체크
    const isWebView = window.navigator.userAgent.includes("Toss");

    if (!isWebView) {
      cachedPlatformResult = false;
      // alert("현재 플랫폼: Web Browser");
      return false;
    }

    // alert("현재 플랫폼: Toss Webview");
    return true;
  } catch (e) {
    cachedPlatformResult = false;
    // alert("현재 플랫폼: Web Browser (Toss API 사용 불가)" + e);
    return false;
  }
}

/**
 * 안드로이드 WebView에서 실행 중인지 확인
 */
export function isAndroidWebView(): boolean {
  return typeof (window as any).AndroidBridge !== "undefined";
}
