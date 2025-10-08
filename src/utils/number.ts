/**
 * 숫자를 지정된 소수점 자릿수로 포맷팅합니다.
 * 불필요한 뒤따르는 0은 제거됩니다.
 *
 * @param value 포맷팅할 숫자
 * @param digits 소수점 자릿수 (기본값: 4)
 * @returns 포맷팅된 문자열
 */
export function fixed(value: number, digits: number = 4): string {
  return parseFloat(value.toFixed(digits)).toString();
}
