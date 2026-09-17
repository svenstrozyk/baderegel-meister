// Erzeugt Illustrationen aus content/regeln.yaml über die OpenAI-Bild-API.
// Aufruf: node scripts/bilder.mjs --regel 7 [--teil geschichte|warum|situation] [--nr 1] [--neu] [--qualitaet medium]
// Ausgabe: public/bilder/regel-XX/<teil>-<nr>.webp  (bestehende Dateien werden ohne --neu übersprungen)
//         --regelbilder → public/bilder/regelbilder/, --detektiv [--szene id] → public/bilder/detektiv/<id>.webp, --ueberraschungen → public/bilder/ueberraschungen/<id>.webp
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const MODELL = 'gpt-image-2';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]]);
    return acc;
  }, []),
);

const env = await fs.readFile(path.join(ROOT, '.env'), 'utf8');
const apiKey = env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
if (!apiKey) throw new Error('OPENAI_API_KEY fehlt in .env');

const inhalt = yaml.load(await fs.readFile(path.join(ROOT, 'content/regeln.yaml'), 'utf8'));
const { praefix, format, figuren } = inhalt.bildstil;

const mitFiguren = (text) => text.replace(/\{(\w+)\}/g, (_, k) => figuren[k] ?? `{${k}}`);

function auftraege(regel) {
  const liste = [];
  regel.geschichte.forEach((g, i) => liste.push({ teil: 'geschichte', nr: i + 1, bild: g.bild, fmt: format.geschichte }));
  regel.warum_frage.antworten.forEach((a, i) => liste.push({ teil: 'warum', nr: i + 1, bild: a.bild, fmt: format.warum_antwort }));
  regel.situationen.forEach((s, i) => liste.push({ teil: 'situation', nr: i + 1, bild: s.bild, fmt: format.situation }));
  return liste;
}

async function erzeuge(auftrag, ziel) {
  const prompt = [praefix, mitFiguren(auftrag.bild), auftrag.fmt.hinweis].filter(Boolean).join(' ');
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELL,
      prompt,
      size: auftrag.fmt.groesse,
      quality: args.qualitaet ?? 'medium',
      output_format: 'webp',
      n: 1,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${json.error?.code ?? ''} ${json.error?.message ?? ''}`);
  await fs.mkdir(path.dirname(ziel), { recursive: true });
  await fs.writeFile(ziel, Buffer.from(json.data[0].b64_json, 'base64'));
}

// Überraschungskarten: je ein niedliches Tier im Wasser (IDs = UEBERRASCHUNGEN in src/lib/state/fortschritt.js)
const UEBERRASCHUNGEN = {
  ente: 'a single cute fluffy yellow duckling paddling happily in clear turquoise water, small ripples around it',
  qualle: 'a single cute friendly pink jellyfish with short wavy tentacles floating in clear blue water, a few bubbles',
  seestern: 'a single cute orange starfish with a friendly face resting on light sand in shallow clear water, sun sparkles on the water',
  muschel: 'a single cute pearly pink scallop seashell with a tiny friendly face half in shallow clear water on light sand, small bubbles',
  krebs: 'a single cute small red crab with a friendly face waving one claw in shallow clear water on light sand',
  fisch: 'a single cute round orange fish with white stripes and a friendly face swimming in clear blue water, a few bubbles',
};

if (args.ueberraschungen) {
  // Aufruf: node scripts/bilder.mjs --ueberraschungen [--id ente] [--neu]
  const fmt = { groesse: '1024x1024', hinweis: 'this image explicitly shows exactly one animal; single simple motif, centered, large, filling most of the square, plain soft water background, no people, no humans, original cute design that does not resemble Pokémon' };
  const liste = Object.entries(UEBERRASCHUNGEN).filter(([id]) => !args.id || id === args.id);
  await Promise.all(liste.map(async ([id, bild]) => {
    const ziel = path.join(ROOT, 'public/bilder/ueberraschungen', `${id}.webp`);
    const rel = path.relative(ROOT, ziel);
    if (!args.neu && (await fs.stat(ziel).catch(() => null))) return console.log(`übersprungen ${rel}`);
    try { await erzeuge({ bild, fmt }, ziel); console.log(`erzeugt      ${rel}`); }
    catch (e) { console.log(`FEHLER       ${rel}: ${e.message}`); }
  }));
  process.exit(0);
}

if (args.detektiv) {
  // Suchbilder für den Regel-Detektiv: node scripts/bilder.mjs --detektiv [--szene freibad] [--neu]
  // Ausgabe: public/bilder/detektiv/<id>.webp (nacheinander wegen Rate-Limit, bei 429 erneuter Versuch)
  const fmt = {
    groesse: format.detektiv?.groesse ?? '1536x1024',
    hinweis: format.detektiv?.hinweis ?? 'hidden-object search picture for young children: every described group is clearly visible, medium-sized and well separated from the others, full bodies visible, nothing cut off at the image border, no additional people anywhere in the picture',
  };
  const liste = inhalt.detektiv.filter((s) => !args.szene || s.id === args.szene);
  for (const szene of liste) {
    const ziel = path.join(ROOT, 'public/bilder/detektiv', `${szene.id}.webp`);
    const rel = path.relative(ROOT, ziel);
    if (!args.neu && (await fs.stat(ziel).catch(() => null))) { console.log(`übersprungen ${rel}`); continue; }
    for (let versuch = 1; versuch <= 4; versuch++) {
      try { await erzeuge({ bild: szene.bild, fmt }, ziel); console.log(`erzeugt      ${rel}`); break; }
      catch (e) {
        if (e.message.startsWith('429') && versuch < 4) { console.log(`429, warte …  ${rel}`); await new Promise((r) => setTimeout(r, 30000)); continue; }
        console.log(`FEHLER       ${rel}: ${e.message}`); break;
      }
    }
  }
  process.exit(0);
}

if (args.regelbilder) {
  // Regelbilder: ein klares Bild pro Regel für Karten, Inseln und „Welche Regel?“
  const liste = inhalt.regeln.filter((r) => !args.regel || String(r.id) === String(args.regel));
  await Promise.all(liste.map(async (r) => {
    const ziel = path.join(ROOT, 'public/bilder/regelbilder', `regel-${String(r.id).padStart(2, '0')}.webp`);
    const rel = path.relative(ROOT, ziel);
    if (!args.neu && (await fs.stat(ziel).catch(() => null))) return console.log(`übersprungen ${rel}`);
    try { await erzeuge({ bild: r.regelbild, fmt: format.regelbild }, ziel); console.log(`erzeugt      ${rel}`); }
    catch (e) { console.log(`FEHLER       ${rel}: ${e.message}`); }
  }));
  process.exit(0);
}

const regeln = inhalt.regeln.filter((r) => !args.regel || String(r.id) === String(args.regel));
for (const regel of regeln) {
  const ordner = path.join(ROOT, 'public/bilder', `regel-${String(regel.id).padStart(2, '0')}`);
  const todo = auftraege(regel).filter((a) => (!args.teil || a.teil === args.teil) && (!args.nr || String(a.nr) === String(args.nr)));
  await Promise.all(
    todo.map(async (a) => {
      const ziel = path.join(ordner, `${a.teil}-${a.nr}.webp`);
      const rel = path.relative(ROOT, ziel);
      if (!args.neu && (await fs.stat(ziel).catch(() => null))) return console.log(`übersprungen ${rel}`);
      try {
        await erzeuge(a, ziel);
        console.log(`erzeugt      ${rel}`);
      } catch (e) {
        console.log(`FEHLER       ${rel}: ${e.message}`);
      }
    }),
  );
}
