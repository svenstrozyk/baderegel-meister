// Leitet aus einer Hauptfarbe alle Töne eines Monsters ab (Bauch, Schatten, Akzent, Outline).
import { FARBEN } from './farben.js';

function hexZuRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function rgbZuHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
export function mische(a, b, t) {
  const x = hexZuRgb(a), y = hexZuRgb(b);
  return rgbZuHex(x.map((v, i) => v + (y[i] - v) * t));
}
function rgbZuHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}
function hslZuRgb([h, s, l]) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}
export function dreheFarbton(hex, grad, dl = 0, ds = 0) {
  const [h, s, l] = rgbZuHsl(hexZuRgb(hex));
  return rgbZuHex(hslZuRgb([(h + grad + 360) % 360, Math.max(0, Math.min(1, s + ds)), Math.max(0, Math.min(1, l + dl))]));
}
export function istWarm(hex) {
  const [h, s, l] = rgbZuHsl(hexZuRgb(hex));
  return (h < 70 || h > 300) && s > 0.2;
}

export const TINTE = '#1d1b33'; // Grund-Outline-Ton

function hellWert(hex) {
  const [r, g, b] = hexZuRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function palette(farbId) {
  const haupt = FARBEN[farbId] ?? FARBEN.meerblau;
  const akzent = dreheFarbton(haupt, istWarm(haupt) ? -28 : 38, 0.04, 0.05);
  return {
    haupt,
    schatten: mische(haupt, '#2a2060', 0.3),
    hell: mische(haupt, '#ffffff', 0.62),
    hellSchatten: mische(mische(haupt, '#ffffff', 0.62), '#6a5a9a', 0.22),
    dunkel: mische(haupt, TINTE, 0.45),
    akzent,
    akzentSchatten: mische(akzent, '#2a2060', 0.3),
    akzentHell: mische(akzent, '#ffffff', 0.5),
    linie: mische(haupt, TINTE, 0.84),
    iris: mische(mische(haupt, '#16307a', 0.55), '#000000', 0.15),
    irisHell: mische(haupt, '#7fe3ff', 0.35),
    muster: hellWert(haupt) > 0.62 ? mische(akzent, TINTE, 0.12) : mische(akzent, '#ffffff', 0.35),
    wange: '#ff7fa0',
  };
}
