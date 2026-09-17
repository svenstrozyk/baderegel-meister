// Wandelt content/*.yaml in src/content.json für die App um (nur Regeln mit vorhandenen Bildern).
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const lade = async (f) => yaml.load(await fs.readFile(path.join(ROOT, 'content', f), 'utf8'));
const regeln = await lade('regeln.yaml');
const monster = await lade('monster.yaml');

const vorhanden = [];
for (const r of regeln.regeln) {
  const ordner = `regel-${String(r.id).padStart(2, '0')}`;
  if (await fs.stat(path.join(ROOT, 'public/bilder', ordner)).catch(() => null)) vorhanden.push({ ...r, ordner });
}
const { bildstil, ...rest } = regeln;
// Detektiv-Szenen: Bildprompt weglassen, Bild-Existenz vermerken (fehlt es, zeigt die App die Szene als „bald“)
const detektiv = [];
for (const { bild, ...szene } of rest.detektiv ?? []) {
  const datei = `bilder/detektiv/${szene.id}.webp`;
  detektiv.push({ ...szene, bild: datei, bildVorhanden: !!(await fs.stat(path.join(ROOT, 'public', datei)).catch(() => null)) });
}
await fs.writeFile(path.join(ROOT, 'src/content.json'), JSON.stringify({ regeln: vorhanden, alleRegeln: regeln.regeln.map(({ id, kurz, symbol, merksatz }) => {
    const ordner = `regel-${String(id).padStart(2, '0')}`;
    return { id, kurz, symbol, merksatz, ordner, regelbild: `bilder/regelbilder/${ordner}.webp` };
  }), detektiv, monster }, null, 2));
console.log(`content.json: ${vorhanden.length} Regeln (${vorhanden.map((r) => r.id).join(', ')})`);
