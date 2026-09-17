// Selbstprüfung: rendert Monster als statisches HTML-Blatt und fotografiert es mit Headless-Chrome.
// Aufruf: node src/lib/monster/werkzeug/vorschau.mjs <ausgabe.png> '<json-liste von props>'|@datei.json [spalten] [groesse] [zoom]
// Zusätzliche Felder je Eintrag: phase (0..1, Animationsphase), t (Sekunden, globaler Zeitpunkt), label
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { monsterSvg } from '../rig.js';

const [ziel = '/tmp/claude-501/monster/blatt.png', json = '[]', spalten = '3', groesse = '300', zoom = '1'] = process.argv.slice(2);
const liste = JSON.parse(json.startsWith('@') ? (await import('node:fs')).readFileSync(json.slice(1), 'utf8') : json);
const g = +groesse, sp = +spalten;
const zellen = liste.map((p, i) =>
  `<div class="z" style="--wm-phase:${p.phase ?? 0};--t:${-(p.t ?? 0)}s">${monsterSvg(p, 'v' + i, { groesse: g })}${p.label ? `<b>${p.label}</b>` : ''}</div>`).join('');
const html = `<!doctype html><html><head><style>
body{margin:0;background:#bfe6f5;display:grid;grid-template-columns:repeat(${sp},${g}px);gap:6px;padding:6px;font:11px system-ui}
.z{width:${g}px;height:${g}px;background:rgba(255,255,255,.4);border-radius:6px;position:relative}
.z b{position:absolute;left:4px;top:2px;font-weight:600;color:#335}
.z *{animation-play-state:paused!important}
.z>svg{transform:scale(${zoom});transform-origin:50% 96%}
.z{overflow:hidden}
</style></head><body>${zellen}</body></html>`;
const datei = ziel.replace(/\.png$/, '.html');
writeFileSync(datei, html);
const hoehe = Math.ceil(liste.length / sp) * (g + 6) + 6;
const breite = sp * (g + 6) + 6;
execFileSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--screenshot=${ziel}`, `--window-size=${breite},${hoehe}`, 'file://' + datei,
], { stdio: 'ignore', timeout: 90000 });
console.log(ziel);
