let cachedPlatformResult: boolean | null = null;

export function isTossApp(): boolean {
  if (cachedPlatformResult !== null) {
    return cachedPlatformResult;
  }

  try {
    // @ts-ignore - getSafeAreaInsets는 Toss App에서만 사용 가능
    getSafeAreaInsets();
    cachedPlatformResult = true;
    return true;
  } catch (e) {
    cachedPlatformResult = false;
    return false;
  }
}