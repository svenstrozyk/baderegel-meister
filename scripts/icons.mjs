// Erzeugt App-Icons (PWA + iOS Home-Bildschirm) aus einem Partner-Monster.
// Aufruf: node scripts/icons.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { monsterSvg } from '../src/lib/monster/rig.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const monster = monsterSvg({ art: 'pingo', stufe: 1, farbe: 'tuerkis', muster: 'keins', zubehoer: ['taucherbrille'], pose: 'winken', groesse: 300 });
const innen = monster.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="1024" height="1024">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd3ff"/><stop offset="1" stop-color="#0b6fb8"/></linearGradient></defs>
  <rect width="300" height="300" fill="url(#bg)"/>
  <circle cx="252" cy="46" r="26" fill="#ffd23f"/>
  <g transform="translate(-75 -140) scale(1.5)">${innen}</g>
</svg>`;
const ziel = path.join(ROOT, 'public/icons');
await fs.mkdir(ziel, { recursive: true });
for (const g of [180, 192, 512]) await sharp(Buffer.from(svg)).resize(g, g).png().toFile(path.join(ziel, `icon-${g}.png`));
console.log('Icons erzeugt: public/icons/icon-{180,192,512}.png');
