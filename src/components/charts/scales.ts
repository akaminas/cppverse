// Scales and number formatting following Vellum: three to five ticks at
// round values (steps 1, 2, 2.5, 5 × 10^n), a true minus sign, en-GB grouping.

import type { VellumFamily } from '../../data/types';

export const SLOT_ORDER: VellumFamily[] = ['teal', 'terracotta', 'indigo', 'ochre', 'mauve', 'moss'];

export const tone = (f: VellumFamily) => `var(--v-${f})`;
export const tint = (f: VellumFamily) => `var(--v-${f}-tint)`;
export const deep = (f: VellumFamily) => `var(--v-${f}-deep)`;

export function niceTicks(lo: number, hi: number, target = 4): number[] {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [];
  if (lo === hi) return [lo];
  const span = hi - lo;
  const raw = span / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const steps = [1, 2, 2.5, 5, 10].map((s) => s * mag);
  let best = steps[0];
  for (const s of steps) {
    const n = Math.floor(hi / s) - Math.ceil(lo / s) + 1;
    if (n >= 3 && n <= 6) {
      best = s;
      break;
    }
    best = s;
  }
  const out: number[] = [];
  for (let v = Math.ceil(lo / best - 1e-9) * best; v <= hi + best * 1e-9; v += best) out.push(Math.abs(v) < best * 1e-9 ? 0 : v);
  return out;
}

/** Ticks for a log10 axis: powers of ten (thinned to at most six). */
export function logTicks(lo: number, hi: number): number[] {
  const a = Math.floor(Math.log10(lo));
  const b = Math.ceil(Math.log10(hi));
  const all: number[] = [];
  for (let e = a; e <= b; e++) all.push(Math.pow(10, e));
  const stride = Math.ceil(all.length / 6);
  return all.filter((_, i) => i % stride === 0).filter((v) => v >= lo * 0.999 && v <= hi * 1.001);
}

const nf = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 6 });

/** Format a number for labels: true minus, sensible precision, superscript powers of ten for tiny/huge values. */
export function fmt(v: number, digits?: number): string {
  if (!Number.isFinite(v)) return '—';
  const abs = Math.abs(v);
  let s: string;
  if (abs !== 0 && (abs < 1e-3 || abs >= 1e6)) {
    const e = Math.floor(Math.log10(abs) + 1e-12);
    const m = Math.round((abs / Math.pow(10, e)) * 100) / 100;
    const sign = v < 0 ? '−' : '';
    s = m === 1 ? `${sign}10${superscript(e)}` : `${sign}${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(m)} × 10${superscript(e)}`;
  } else if (digits !== undefined) {
    s = new Intl.NumberFormat('en-GB', { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(v);
  } else {
    s = nf.format(Math.round(v * 1e6) / 1e6);
  }
  return s.replace(/-/g, '−');
}

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const superscript = (n: number) => String(n).split('').map((c) => SUP[c] ?? c).join('');

export type ScaleType = 'linear' | 'log';

export interface Scale {
  (v: number): number;
  domain: [number, number];
  range: [number, number];
  ticks: number[];
  type: ScaleType;
}

export function makeScale(domain: [number, number], range: [number, number], type: ScaleType = 'linear', ticks?: number[]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const f =
    type === 'log'
      ? (v: number) => r0 + ((Math.log10(Math.max(v, 1e-300)) - Math.log10(d0)) / (Math.log10(d1) - Math.log10(d0))) * (r1 - r0)
      : (v: number) => (d1 === d0 ? (r0 + r1) / 2 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0));
  const s = f as Scale;
  s.domain = domain;
  s.range = range;
  s.type = type;
  s.ticks = ticks ?? (type === 'log' ? logTicks(d0, d1) : niceTicks(d0, d1));
  return s;
}

/** Extend a data extent to the outer ticks so the grid frames the data. */
export function niceDomain(lo: number, hi: number, type: ScaleType = 'linear', includeZero = false): [number, number] {
  if (type === 'log') {
    return [Math.pow(10, Math.floor(Math.log10(lo))), Math.pow(10, Math.ceil(Math.log10(hi)))];
  }
  let a = includeZero ? Math.min(0, lo) : lo;
  let b = includeZero ? Math.max(0, hi) : hi;
  if (a === b) {
    a -= 1;
    b += 1;
  }
  const t = niceTicks(a, b);
  const step = t.length > 1 ? t[1] - t[0] : 1;
  return [Math.floor(a / step + 1e-9) * step, Math.ceil(b / step - 1e-9) * step];
}
