type RGB = [number, number, number];

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// sRGB <-> Linear (IEC 61966-2-1)
const srgbToLinear = (u: number): number =>
  u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);

const linearToSrgb = (u: number): number =>
  u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055;

// 0xRRGGBB ↔ [0..1] 변환 유틸
const unpack = (hex: number): RGB => [
  ((hex >>> 16) & 0xff) / 255,
  ((hex >>> 8) & 0xff) / 255,
  (hex & 0xff) / 255,
];

const pack = ([r, g, b]: RGB): number =>
  // >>> 0 로 부호 없는 32비트로 정규화
  ((((r * 255) & 0xff) << 16) |
    (((g * 255) & 0xff) << 8) |
    ((b * 255) & 0xff)) >>>
  0;

// 감마 보정 보간
export function lerpColorGammaCorrect(
  startColor: number,
  endColor: number,
  t: number
): number {
  const s = unpack(startColor).map(srgbToLinear) as RGB;
  const e = unpack(endColor).map(srgbToLinear) as RGB;

  const l: RGB = [
    lerp(s[0], e[0], t),
    lerp(s[1], e[1], t),
    lerp(s[2], e[2], t),
  ];

  const srgb: RGB = [
    Math.min(1, Math.max(0, linearToSrgb(l[0]))),
    Math.min(1, Math.max(0, linearToSrgb(l[1]))),
    Math.min(1, Math.max(0, linearToSrgb(l[2]))),
  ];

  return pack(srgb);
}
