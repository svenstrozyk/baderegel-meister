// Reine Fortschrittslogik (ohne DOM/Svelte) – testbar mit `node --test`.
//
// Datenmodell:
//   fortschritt = {
//     regeln: { [regelId]: { geschichteGesehen: bool, teile: { [datum 'JJJJ-MM-TT']: { kennen, warum, trainer, situationen } } } },
//     ueberraschungen: string[]
//   }
// Tages-Erfolg pro Lernziel:
//   kennen       = Kennen-Aufgabe (1. Versuch richtig) + Trainer bestätigt, am selben Tag
//   verstehen    = Warum-Aufgabe (1. Versuch richtig) + Trainer bestätigt, am selben Tag
//   einschaetzen = alle Situationen einer Sitzung im 1. Versuch richtig
// Ein Lernziel gilt als erreicht nach Tages-Erfolg an 2 verschiedenen Kalendertagen (Testmodus: 1).

export const ZIELE = ['kennen', 'verstehen', 'einschaetzen'];
export const TEILE = ['kennen', 'warum', 'trainer', 'situationen'];
export const KARTEN_STUFEN = ['keine', 'normal', 'glitzernd', 'gold'];

export const UEBERRASCHUNGEN = [
  { id: 'ente', bild: 'bilder/ueberraschungen/ente.webp' },
  { id: 'qualle', bild: 'bilder/ueberraschungen/qualle.webp' },
  { id: 'seestern', bild: 'bilder/ueberraschungen/seestern.webp' },
  { id: 'muschel', bild: 'bilder/ueberraschungen/muschel.webp' },
  { id: 'krebs', bild: 'bilder/ueberraschungen/krebs.webp' },
  { id: 'fisch', bild: 'bilder/ueberraschungen/fisch.webp' },
];
export const UEBERRASCHUNG_CHANCE = 0.3;

const zwei = (n) => String(n).padStart(2, '0');

/** Lokales Kalenderdatum als 'JJJJ-MM-TT'. */
export function datumVon(d = new Date()) {
  return `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`;
}

export function leererFortschritt() {
  return { regeln: {}, ueberraschungen: [] };
}

// JSON-Kopie statt structuredClone: funktioniert auch mit Svelte-$state-Proxys.
function kopie(fp) {
  return JSON.parse(JSON.stringify(fp ?? leererFortschritt()));
}

function regelEintrag(fp, regelId) {
  return (fp.regeln[regelId] ??= { geschichteGesehen: false, teile: {} });
}

/** Meldet einen Teilerfolg (kennen|warum|trainer|situationen) für ein Datum. Gibt neuen Fortschritt zurück. */
export function meldeErfolg(fp, regelId, teil, datum) {
  if (!TEILE.includes(teil)) throw new Error(`Unbekannter Teil: ${teil}`);
  const neu = kopie(fp);
  const tag = (regelEintrag(neu, regelId).teile[datum] ??= {});
  tag[teil] = true;
  return neu;
}

export function markiereGeschichte(fp, regelId) {
  const neu = kopie(fp);
  regelEintrag(neu, regelId).geschichteGesehen = true;
  return neu;
}

function tagErfolg(tag, ziel) {
  if (!tag) return false;
  if (ziel === 'kennen') return !!(tag.kennen && tag.trainer);
  if (ziel === 'verstehen') return !!(tag.warum && tag.trainer);
  if (ziel === 'einschaetzen') return !!tag.situationen;
  throw new Error(`Unbekanntes Ziel: ${ziel}`);
}

/** Sortierte Liste der Kalendertage mit Tages-Erfolg für ein Ziel. */
export function erfolgsTage(fp, regelId, ziel) {
  const teile = fp?.regeln?.[regelId]?.teile ?? {};
  return Object.keys(teile).filter((d) => tagErfolg(teile[d], ziel)).sort();
}

export function benoetigteTage({ testmodus = false } = {}) {
  return testmodus ? 1 : 2;
}

export function zielErreicht(fp, regelId, ziel, opts = {}) {
  return erfolgsTage(fp, regelId, ziel).length >= benoetigteTage(opts);
}

/** Karten-Stufe 0..3 = Anzahl erreichter Lernziele (0 keine, 1 normal, 2 glitzernd, 3 gold). */
export function karteStufe(fp, regelId, opts = {}) {
  return ZIELE.filter((z) => zielErreicht(fp, regelId, z, opts)).length;
}

/**
 * Anzeige-Zustand je Lernziel: leer (noch nie) | halb (an weniger Tagen als nötig) | voll (erreicht).
 * Reihenfolge wie ZIELE: kennen (Auge), verstehen (Glühbirne), einschaetzen (Daumen hoch).
 */
export function zielStaende(fp, regelId, opts = {}) {
  const noetig = benoetigteTage(opts);
  return ZIELE.map((ziel) => {
    const tage = erfolgsTage(fp, regelId, ziel).length;
    return { ziel, tage, stand: tage >= noetig ? 'voll' : tage > 0 ? 'halb' : 'leer' };
  });
}

/** Anzahl Lernziele, die schon an mindestens einem Tag geklappt haben, aber noch nicht erreicht sind ("halb leuchtend"). */
export function angefangeneZiele(fp, regelId, opts = {}) {
  return ZIELE.filter((z) => {
    const tage = erfolgsTage(fp, regelId, z).length;
    return tage > 0 && tage < benoetigteTage(opts);
  }).length;
}

export function hatOrden(fp, regelId, opts = {}) {
  return karteStufe(fp, regelId, opts) === ZIELE.length;
}

export function ordenAnzahl(fp, regelIds, opts = {}) {
  return regelIds.filter((id) => hatOrden(fp, id, opts)).length;
}

/** Entwicklungsstufe 1..3 aus Orden-Anzahl und Konstanten aus monster.yaml (entwicklung). */
export function entwicklungsStufe(orden, entwicklung) {
  if (orden >= entwicklung.stufe_3_ab_orden) return 3;
  if (orden >= entwicklung.stufe_2_ab_orden) return 2;
  return 1;
}

/** IDs des freigeschalteten Zubehörs (monster.yaml gestaltung.zubehoer). */
export function freiesZubehoer(orden, zubehoer) {
  return zubehoer.filter((z) => orden >= z.ab_orden).map((z) => z.id);
}

/** Momentaufnahme für Vorher/Nachher-Vergleich am Sitzungsende. */
export function bilanz(fp, regelIds, entwicklung, opts = {}) {
  const karten = Object.fromEntries(regelIds.map((id) => [id, karteStufe(fp, id, opts)]));
  const staende = Object.fromEntries(regelIds.map((id) => [id, zielStaende(fp, id, opts).map((z) => z.stand)]));
  const orden = ordenAnzahl(fp, regelIds, opts);
  return { karten, staende, orden, entwicklung: entwicklungsStufe(orden, entwicklung) };
}

export function vergleich(vorher, nachher) {
  const neueStufen = Object.keys(nachher.karten)
    .filter((id) => nachher.karten[id] > (vorher.karten[id] ?? 0))
    .map((id) => ({ regelId: Number.isNaN(Number(id)) ? id : Number(id), von: vorher.karten[id] ?? 0, zu: nachher.karten[id] }));
  const RANG = { leer: 0, halb: 1, voll: 2 };
  const geaenderteZiele = [];
  for (const id of Object.keys(nachher.staende ?? {})) {
    nachher.staende[id].forEach((zu, i) => {
      const von = vorher.staende?.[id]?.[i] ?? 'leer';
      if (RANG[zu] > RANG[von]) geaenderteZiele.push({ regelId: Number.isNaN(Number(id)) ? id : Number(id), ziel: ZIELE[i], von, zu });
    });
  }
  return {
    neueStufen,
    geaenderteZiele,
    neueOrden: neueStufen.filter((s) => s.zu === ZIELE.length).map((s) => s.regelId),
    entwickelt: nachher.entwicklung > vorher.entwicklung,
    entwicklungVon: vorher.entwicklung,
    entwicklungZu: nachher.entwicklung,
  };
}

/**
 * Seltene Überraschungskarte – nur nach echtem Lernerfolg (mind. eine neue Karten-Stufe).
 * `zufall` injizierbar für Tests. Gibt { fortschritt, karte } zurück (karte = null wenn keine).
 */
export function ueberraschungVergeben(fp, neueStufenAnzahl, zufall = Math.random) {
  if (!neueStufenAnzahl) return { fortschritt: fp, karte: null };
  const offen = UEBERRASCHUNGEN.filter((u) => !(fp.ueberraschungen ?? []).includes(u.id));
  if (!offen.length || zufall() >= UEBERRASCHUNG_CHANCE) return { fortschritt: fp, karte: null };
  const karte = offen[Math.floor(zufall() * offen.length) % offen.length];
  const neu = kopie(fp);
  neu.ueberraschungen = [...(neu.ueberraschungen ?? []), karte.id];
  return { fortschritt: neu, karte };
}

/** Hat die Regel heute schon irgendeinen Teilerfolg? */
export function heuteGeuebt(fp, regelId, datum) {
  const tag = fp?.regeln?.[regelId]?.teile?.[datum];
  return !!tag && Object.values(tag).some(Boolean);
}

/**
 * Vorschlag „Heute dran“: verfügbare Regel ohne Orden, die heute noch nicht geübt wurde,
 * mit dem geringsten Fortschritt (bei Gleichstand die kleinste ID). Sonst erste ohne Orden, sonst erste.
 */
export function heuteDran(fp, verfuegbareIds, datum, opts = {}) {
  if (!verfuegbareIds.length) return null;
  const offen = verfuegbareIds.filter((id) => !hatOrden(fp, id, opts));
  const kandidaten = offen.filter((id) => !heuteGeuebt(fp, id, datum));
  const wahl = (liste) =>
    [...liste].sort((a, b) => karteStufe(fp, a, opts) - karteStufe(fp, b, opts) || a - b)[0];
  if (kandidaten.length) return wahl(kandidaten);
  if (offen.length) return wahl(offen);
  return verfuegbareIds[0];
}
