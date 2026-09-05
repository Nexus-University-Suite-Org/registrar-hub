export interface Hsl {
  h: number;
  s: number;
  l: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function parseHsl(input: string | null | undefined): Hsl | null {
  if (!input) return null;
  const t = input.trim();
  if (t.startsWith("#")) return hexToHsl(t);
  const m = t.match(/([\d.]+)\D+([\d.]+)\s*%\D+([\d.]+)\s*%/);
  if (!m) return null;
  return {
    h: clamp(parseFloat(m[1]), 0, 360),
    s: clamp(parseFloat(m[2]), 0, 100),
    l: clamp(parseFloat(m[3]), 0, 100),
  };
}

export function hslToTriplet(hsl: Hsl): string {
  return `${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%`;
}

export function hslToCss(hsl: Hsl): string {
  return `hsl(${hslToTriplet(hsl)})`;
}

export function adjustHsl(hsl: Hsl, dh = 0, ds = 0, dl = 0): Hsl {
  return {
    h: clamp(hsl.h + dh, 0, 360),
    s: clamp(hsl.s + ds, 0, 100),
    l: clamp(hsl.l + dl, 0, 100),
  };
}

export function hexToHsl(hex: string): Hsl {
  let normalized = hex.trim().replace(/^#/, "");
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(normalized, 16);
  if (Number.isNaN(num) || normalized.length !== 6) {
    return { h: 24, s: 100, l: 50 };
  }
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: clamp(h, 0, 360), s: clamp(s * 100, 0, 100), l: clamp(l * 100, 0, 100) };
}

export function hslToHex(hsl: Hsl): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(color * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}