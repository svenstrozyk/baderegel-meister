// Globaler App-Zustand (Svelte 5 Runes) + Persistenz. Logik liegt in fortschritt.js.
import content from '../../content.json';
import { laden, speichern } from './speicher.js';
import {
  leererFortschritt, angefangeneZiele, zielStaende, bilanz, datumVon, entwicklungsStufe, freiesZubehoer, heuteDran, karteStufe, ordenAnzahl,
} from './fortschritt.js';

export const REGELN = content.regeln;
export const ALLE_REGELN = content.alleRegeln;
export const MONSTER = content.monster;

// Detektiv-Szenen. Browser-Test ohne fertige Bereiche: ?detektivtest ergänzt fehlende Bereiche mit Testkreisen
// (nur im Speicher, nichts wird geschrieben).
const detektivTest = typeof location !== 'undefined' && new URLSearchParams(location.search).has('detektivtest');
export const DETEKTIV = content.detektiv.map((s) =>
  detektivTest
    ? { ...s, bildVorhanden: true, funde: s.funde.map((f, i) => ({ ...f, bereich: f.bereich ?? { x: 15 + ((i * 23) % 75), y: 30 + ((i * 17) % 45), r: 8 } })) }
    : s,
);
export const VERFUEGBAR = REGELN.map((r) => r.id);
export const ALLE_IDS = ALLE_REGELN.map((r) => r.id);

export const regelVon = (id) => REGELN.find((r) => r.id === id);
export const szeneVon = (id) => DETEKTIV.find((s) => s.id === id);
export const kurzVon = (id) => ALLE_REGELN.find((r) => r.id === id);
export const monsterVon = (art) => MONSTER.monster.find((m) => m.id === art);

const gespeichert = laden() ?? {};

export const app = $state({
  // profil: { art, farbe, muster, name, zubehoer: string[] } | null
  profil: gespeichert.profil ?? null,
  fortschritt: gespeichert.fortschritt ?? leererFortschritt(),
  einstellungen: { testmodus: false, ...(gespeichert.einstellungen ?? {}) },
  // album: { [kartenId]: { x, y } } in Prozent der Szene
  album: gespeichert.album ?? {},
  // zuletzt angezeigte Entwicklungsstufe (für Feier-Animation)
  gesehenEntwicklung: gespeichert.gesehenEntwicklung ?? 1,
});

$effect.root(() => {
  $effect(() => {
    speichern($state.snapshot(app));
  });
});

export const opts = () => ({ testmodus: app.einstellungen.testmodus });
export const heute = () => datumVon(new Date());

export function aktuelleBilanz() {
  return bilanz(app.fortschritt, ALLE_IDS, MONSTER.entwicklung, opts());
}

export function orden() {
  return ordenAnzahl(app.fortschritt, ALLE_IDS, opts());
}

export function monsterStufe() {
  return entwicklungsStufe(orden(), MONSTER.entwicklung);
}

export function zubehoerFrei() {
  return freiesZubehoer(orden(), MONSTER.gestaltung.zubehoer);
}

/** Getragenes Zubehör, gefiltert auf freigeschaltete Teile. */
export function zubehoerAn() {
  const frei = zubehoerFrei();
  return (app.profil?.zubehoer ?? []).filter((z) => frei.includes(z));
}

export function karte(id) {
  return karteStufe(app.fortschritt, id, opts());
}

/** [{ ziel, tage, stand: 'leer'|'halb'|'voll' }] für Kennen, Verstehen, Einschätzen */
export function staende(id) {
  return zielStaende(app.fortschritt, id, opts());
}

export function angefangen(id) {
  return angefangeneZiele(app.fortschritt, id, opts());
}

export function vorschlag() {
  return heuteDran(app.fortschritt, VERFUEGBAR, heute(), opts());
}

export function zuruecksetzen() {
  app.fortschritt = leererFortschritt();
  app.album = {};
  app.gesehenEntwicklung = 1;
  if (app.profil) app.profil.zubehoer = [];
}
