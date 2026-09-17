// Komprimiert alle WebP-Bilder in public/bilder (Qualität 72, Originalgröße bleibt).
// Originale werden vorher nach assets-original/bilder gesichert (nicht im Repo).
// Aufruf: node scripts/bilder-komprimieren.mjs   (neu erzeugte Bilder danach erneut komprimieren)
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const QUELLE = path.join(ROOT, 'public/bilder');
const SICHERUNG = path.join(ROOT, 'assets-original/bilder');

async function* webps(ordner) {
  for (const e of await fs.readdir(ordner, { withFileTypes: true })) {
    const p = path.join(ordner, e.name);
    if (e.isDirectory()) yield* webps(p);
    else if (e.name.endsWith('.webp')) yield p;
  }
}

let vorher = 0, nachher = 0;
for await (const datei of webps(QUELLE)) {
  const alt = await fs.readFile(datei);
  const sicherung = path.join(SICHERUNG, path.relative(QUELLE, datei));
  if (!(await fs.stat(sicherung).catch(() => null))) {
    await fs.mkdir(path.dirname(sicherung), { recursive: true });
    await fs.writeFile(sicherung, alt);
  }
  if (alt.length < 400 * 1024) { vorher += alt.length; nachher += alt.length; continue; } // schon komprimiert
  const neu = await sharp(alt).webp({ quality: 72, effort: 6 }).toBuffer();
  await fs.writeFile(datei, neu);
  vorher += alt.length; nachher += neu.length;
}
console.log(`Bilder: ${(vorher / 1048576).toFixed(1)} MB -> ${(nachher / 1048576).toFixed(1)} MB`);
