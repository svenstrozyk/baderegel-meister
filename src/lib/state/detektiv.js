// Reine Logik für den Detektiv-Modus (Suchbilder) – ohne DOM/Svelte, testbar mit `node --test`.
//
// Szene: { id, intro, funde: [{ id, regel, art: 'fehler'|'richtig', text, bereich: {x, y, r} | null }] }
// bereich: x/y = Mittelpunkt in % der Bildbreite/-höhe, r = Radius in % der BILDBREITE.
// Fortschritt: fortschritt.detektiv = { [szeneId]: 'JJJJ-MM-TT' } (Datum der ersten vollständigen Lösung)
import { ueberraschungVergeben } from './fortschritt.js';

export const SEITENVERHAELTNIS = 3 / 2;

/** Eine Szene ist spielbar, wenn das Bild existiert und jeder Fund einen Trefferbereich hat. */
export function szeneSpielbar(szene, bildVorhanden = true) {
  return !!bildVorhanden && !!szene?.funde?.length && szene.funde.every((f) => f.bereich && Number.isFinite(f.bereich.r));
}

export const fehlerFunde = (szene) => szene.funde.filter((f) => f.art === 'fehler');
export const richtigFunde = (szene) => szene.funde.filter((f) => f.art === 'richtig');

/**
 * Sichtbares Bild bei object-fit: contain in einem Container (Letterboxing).
 * Gibt { links, oben, breite, hoehe } in px relativ zum Container zurück.
 */
export function bildRechteck(containerBreite, containerHoehe, verhaeltnis = SEITENVERHAELTNIS) {
  if (!(containerBreite > 0) || !(containerHoehe > 0)) return { links: 0, oben: 0, breite: 0, hoehe: 0 };
  let breite = containerBreite;
  let hoehe = breite / verhaeltnis;
  if (hoehe > containerHoehe) {
    hoehe = containerHoehe;
    breite = hoehe * verhaeltnis;
  }
  return { links: (containerBreite - breite) / 2, oben: (containerHoehe - hoehe) / 2, breite, hoehe };
}

/** Tipp-Punkt (px relativ zum Container) → Prozent im sichtbaren Bild; null, wenn außerhalb (im Letterbox-Rand). */
export function punktImBild(px, py, rechteck) {
  const x = ((px - rechteck.links) / rechteck.breite) * 100;
  const y = ((py - rechteck.oben) / rechteck.hoehe) * 100;
  if (!(rechteck.breite > 0) || x < 0 || x > 100 || y < 0 || y > 100) return null;
  return { x, y };
}

/**
 * Welcher Fund liegt unter dem Punkt (x, y in % des Bildes)?
 * Abstand in Einheiten der Bildbreite (y wird mit Höhe/Breite umgerechnet). Bei Überlappung gewinnt der
 * Fund, dessen Mittelpunkt relativ zum Radius am nächsten liegt. Gibt den Fund oder null zurück.
 */
export function trefferPruefen(funde, x, y, verhaeltnis = SEITENVERHAELTNIS) {
  let bester = null;
  let besterWert = Infinity;
  for (const f of funde) {
    if (!f.bereich) continue;
    const dx = x - f.bereich.x;
    const dy = (y - f.bereich.y) / verhaeltnis;
    const wert = Math.hypot(dx, dy) / f.bereich.r;
    if (wert <= 1 && wert < besterWert) {
      bester = f;
      besterWert = wert;
    }
  }
  return bester;
}

export function alleFehlerGefunden(szene, gefundenIds) {
  return fehlerFunde(szene).every((f) => gefundenIds.includes(f.id));
}

/** Nächster noch nicht gefundener Fehler-Fund (für Tipps) oder null. */
export function naechsterTipp(szene, gefundenIds) {
  return fehlerFunde(szene).find((f) => !gefundenIds.includes(f.id) && f.bereich) ?? null;
}

export function szeneGeloest(fp, szeneId) {
  return !!fp?.detektiv?.[szeneId];
}

/**
 * Szene als gelöst merken. Beim ersten Lösen gibt es verlässlich eine Überraschungskarte
 * (bestehende Logik, ohne Zufall: nächste noch fehlende Karte), solange noch welche offen sind.
 * Gibt { fortschritt, ersteMal, karte } zurück; fp bleibt unverändert.
 */
export function szeneLoesen(fp, szeneId, datum) {
  if (szeneGeloest(fp, szeneId)) return { fortschritt: fp, ersteMal: false, karte: null };
  const neu = JSON.parse(JSON.stringify(fp));
  neu.detektiv = { ...(neu.detektiv ?? {}), [szeneId]: datum };
  const { fortschritt, karte } = ueberraschungVergeben(neu, 1, () => 0);
  return { fortschritt, ersteMal: true, karte };
}
