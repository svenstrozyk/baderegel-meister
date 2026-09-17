// Vertont alle Texte einer Regel aus content/regeln.yaml.
// Aufruf: node scripts/audio.mjs --regel 7 [--stimme mac|openai] [--neu]
//         node scripts/audio.mjs --app [--stimme mac|openai] [--neu]   (App-Ansagen aus content/app-texte.yaml)
//         node scripts/audio.mjs --detektiv [--szene freibad] [--neu]  (Suchbild-Texte → public/audio/detektiv/<szene>-<schluessel>.m4a)
// Ausgabe: public/audio/regel-XX/<schluessel>.m4a  – Schlüssel siehe texte()
//          public/audio/app/<schluessel>.m4a       – Schlüssel = content/app-texte.yaml > texte
// mac: macOS "say" (Anna) + afconvert, kostenlos. openai: gpt-4o-mini-tts (Endfassung), Stimme per --voice (Standard coral).
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import yaml from 'js-yaml';

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]]);
    return acc;
  }, []),
);
const stimme = args.stimme ?? 'mac';

export function texte(regel) {
  const t = {
    merksatz: regel.merksatz,
    warum: regel.warum,
    raetsel: regel.raetsel,
    geste: regel.geste.text,
    'warum-frage': regel.warum_frage.frage,
    'warum-feedback': regel.warum_frage.feedback,
    'trainer-frage': regel.trainer.frage,
  };
  regel.geschichte.forEach((g, i) => (t[`geschichte-${i + 1}`] = g.text));
  regel.warum_frage.antworten.forEach((a, i) => (t[`warum-${i + 1}`] = a.text));
  regel.situationen.forEach((s, i) => {
    t[`situation-${i + 1}`] = s.text;
    t[`situation-${i + 1}-feedback`] = s.feedback;
  });
  return t;
}

async function mac(text, ziel) {
  const tmp = path.join(os.tmpdir(), `baderegel-${process.pid}-${Math.random().toString(36).slice(2)}.aiff`);
  await run('say', ['-v', 'Anna', '-r', '165', '-o', tmp, text]);
  await run('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', tmp, ziel]);
  await fs.rm(tmp);
}

// Zwei Stimmen: Erzähler für Geschichten, Situationsbeschreibungen und Antwortmöglichkeiten, Monster für alles, was es zum Kind sagt.
const ERZAEHLER = args.erzaehler ?? 'ballad';
const MONSTER = args.monster ?? 'sage';
const OPENAI_STIMME = args.voice ?? MONSTER;
const istErzaehlerText = (schluessel) => /^(geschichte|warum|situation)-\d+$/.test(schluessel);
const OPENAI_ANWEISUNG =
  'Sprich Hochdeutsch ohne Akzent, warm, fröhlich und lebendig wie eine liebevolle Vorleserin für ein fünfjähriges Kind. ' +
  'Ruhiges Tempo, klare Aussprache, kurze natürliche Pausen an Satzzeichen. Bei Lob hörbar begeistert, bei Warnungen freundlich, aber bestimmt.';

async function openai(text, ziel, versuch = 1, voice = OPENAI_STIMME) {
  const env = await fs.readFile(path.join(ROOT, '.env'), 'utf8');
  const apiKey = env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice, input: text, instructions: OPENAI_ANWEISUNG, response_format: 'wav' }),
  });
  if (!res.ok) {
    if ((res.status === 429 || res.status >= 500) && versuch < 5) {
      await new Promise((r) => setTimeout(r, 4000 * versuch));
      return openai(text, ziel, versuch + 1, voice);
    }
    throw new Error(`${res.status} ${await res.text()}`);
  }
  // WAV -> echtes m4a (AAC im MP4-Container), spielt zuverlässig in iOS-Safari
  const tmp = path.join(os.tmpdir(), `baderegel-${process.pid}-${Math.random().toString(36).slice(2)}.wav`);
  await fs.writeFile(tmp, Buffer.from(await res.arrayBuffer()));
  await run('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', tmp, ziel]);
  await fs.rm(tmp);
}

async function vertone(ordner, eintraege) {
  await fs.mkdir(ordner, { recursive: true });
  const offen = [];
  for (const [schluessel, text] of Object.entries(eintraege)) {
    const ziel = path.join(ordner, `${schluessel}.m4a`);
    if (!args.neu && (await fs.stat(ziel).catch(() => null))) continue;
    offen.push([text, ziel]);
  }
  const parallel = stimme === 'openai' ? 4 : 1;
  let i = 0;
  await Promise.all(
    Array.from({ length: parallel }, async () => {
      while (i < offen.length) {
        const [text, ziel] = offen[i++];
        try {
          await (stimme === 'openai' ? openai(text, ziel, 1, args.voice ?? (istErzaehlerText(path.basename(ziel, '.m4a')) && ordner.includes('regel-') ? ERZAEHLER : MONSTER)) : mac(text, ziel));
          console.log(`vertont ${path.relative(ROOT, ziel)}`);
        } catch (e) {
          console.log(`FEHLER  ${path.relative(ROOT, ziel)}: ${e.message}`);
        }
      }
    }),
  );
}

// Nur ausführen, wenn direkt aufgerufen (texte() bleibt importierbar)
if (import.meta.filename === path.resolve(process.argv[1] ?? '')) {
  if (args.probe) {
    // Stimmprobe: gleicher Text mit mehreren OpenAI-Stimmen nach docs/stimmproben/
    const text = 'Hallo! Ich bin dein Wassermonster. Hör mal gut zu: Bei Donner und Blitz gehen wir sofort raus aus dem Wasser – und rein ins Haus! Super gemacht, du bist ein echter Baderegel-Profi!';
    const ordner = path.join(ROOT, 'docs/stimmproben');
    await fs.mkdir(ordner, { recursive: true });
    for (const v of String(args.probe).split(',')) {
      const ziel = path.join(ordner, `${v}.m4a`);
      await openai(text, ziel, 1, v);
      console.log(`probe ${path.relative(ROOT, ziel)}`);
    }
  } else if (args.detektiv) {
    // Detektiv-Suchbilder: <szene>-intro und <szene>-<fund> aus content/regeln.yaml > detektiv
    const inhalt = yaml.load(await fs.readFile(path.join(ROOT, 'content/regeln.yaml'), 'utf8'));
    const eintraege = {};
    for (const szene of inhalt.detektiv ?? []) {
      if (args.szene && args.szene !== szene.id) continue;
      eintraege[`${szene.id}-intro`] = szene.intro;
      for (const fund of szene.funde ?? []) eintraege[`${szene.id}-${fund.id}`] = fund.text;
    }
    await vertone(path.join(ROOT, 'public/audio/detektiv'), eintraege);
  } else if (args.app) {
    const app = yaml.load(await fs.readFile(path.join(ROOT, 'content/app-texte.yaml'), 'utf8'));
    await vertone(path.join(ROOT, 'public/audio/app'), app.texte);
  } else {
    const inhalt = yaml.load(await fs.readFile(path.join(ROOT, 'content/regeln.yaml'), 'utf8'));
    const regeln = inhalt.regeln.filter((r) => !args.regel || String(r.id) === String(args.regel));
    for (const regel of regeln) {
      await vertone(path.join(ROOT, 'public/audio', `regel-${String(regel.id).padStart(2, '0')}`), texte(regel));
    }
  }
}
