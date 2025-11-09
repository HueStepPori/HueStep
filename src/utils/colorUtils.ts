// 색상 유틸리티 함수들

// HEX를 HSL로 변환
export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// 두 색상이 비슷한 계열인지 확인 (허용 범위: 색조 60도, 채도/명도 40%)
export function isSimilarColor(color1: string, color2: string): boolean {
  const hsl1 = hexToHSL(color1);
  const hsl2 = hexToHSL(color2);

  // 무채색(검정, 흰색, 회색) 체크
  const isGrayscale1 = hsl1.s < 10;
  const isGrayscale2 = hsl2.s < 10;

  // 둘 다 무채색이면 허용
  if (isGrayscale1 && isGrayscale2) return true;

  // 하나만 무채색이면 불허
  if (isGrayscale1 || isGrayscale2) return false;

  // 색조 차이 계산 (원형이므로 최소 각도 차이 계산)
  let hueDiff = Math.abs(hsl1.h - hsl2.h);
  if (hueDiff > 180) hueDiff = 360 - hueDiff;

  // 채도와 명도 차이
  const satDiff = Math.abs(hsl1.s - hsl2.s);
  const lightDiff = Math.abs(hsl1.l - hsl2.l);

  // 비슷한 색상 판정: 색조 차이 60도 이내, 채도/명도 차이 40% 이내
  return hueDiff <= 60 && satDiff <= 40 && lightDiff <= 40;
}

// RGB로 밝기 조절
export function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
