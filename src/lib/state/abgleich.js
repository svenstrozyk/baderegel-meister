// Geräte-Abgleich ohne Konto/Server – reine Logik (ohne DOM/Svelte), testbar mit `node --test`.
//
// Ein Gerät kodiert seinen Stand als kurzen Text (als QR-Code, kopiert oder als Datei), das andere Gerät
// dekodiert ihn und führt ihn verlustfrei mit dem eigenen Stand zusammen.
//
// Format: 'BRM1:' + Kennbuchstabe + base64url
//   'z' = JSON deflate-raw-komprimiert (CompressionStream), 'j' = JSON unkomprimiert (Fallback)
// JSON (kompakt): [profil, kalender, regeln, ueberraschungen, detektiv, album]
//   profil          = [art, farbe, muster, name, zubehoer[]] | 0
//   kalender        = alle Übungstage aller Regeln, sortiert, '.'-getrennt als Tagesabstand (base36) zum
//                     vorigen Tag bzw. zu 2026-01-01
//   regeln          = { [regelId]: [geschichteGesehen 0|1, 'masken'] }
//                     masken = 1 Hex-Zeichen je Kalendertag (0 = nicht geübt), Bits der Teile
//                     kennen=1, warum=2, trainer=4, situationen=8; Nullen am Ende weggelassen
//   ueberraschungen = string[]
//   detektiv        = { [szeneId]: Tage seit 2026-01-01 (base36) }
//   album           = { [kartenKey]: [x, y] } (ganze Prozent)
import { TEILE, leererFortschritt } from './fortschritt.js';

export const PRAEFIX = 'BRM1:';
const EPOCHE = Date.UTC(2026, 0, 1);
const TAG_MS = 86400000;
const DATUM_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const zwei = (n) => String(n).padStart(2, '0');
const istObjekt = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
const kopie = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));

function fehler(text) {
  return new Error(text);
}

/** 'JJJJ-MM-TT' → Tage seit 2026-01-01 (null bei ungültigem Datum). */
export function tagNummer(datum) {
  const m = DATUM_RE.exec(datum ?? '');
  if (!m) return null;
  const ms = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(ms);
  if (d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
  return Math.round((ms - EPOCHE) / TAG_MS);
}

/** Tage seit 2026-01-01 → 'JJJJ-MM-TT'. */
export function datumAusNummer(n) {
  const d = new Date(EPOCHE + n * TAG_MS);
  return `${d.getUTCFullYear()}-${zwei(d.getUTCMonth() + 1)}-${zwei(d.getUTCDate())}`;
}

function maskeVon(tag) {
  return TEILE.reduce((m, t, i) => (tag?.[t] ? m | (1 << i) : m), 0);
}

function tagVonMaske(maske) {
  const tag = {};
  TEILE.forEach((t, i) => {
    if (maske & (1 << i)) tag[t] = true;
  });
  return tag;
}

// ---------- base64url + Kompression ----------

function zuBase64url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function ausBase64url(text) {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) throw fehler('Der Code enthält ungültige Zeichen.');
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((text.length + 3) % 4);
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
}

async function durchStrom(bytes, strom) {
  const stream = new Blob([bytes]).stream().pipeThrough(strom);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const kompressionDa = () => typeof CompressionStream === 'function' && typeof Response === 'function';

// ---------- Kodieren ----------

function kompakt(daten) {
  const d = kopie(daten) ?? {};
  const p = d.profil;
  const profil = istObjekt(p) && typeof p.art === 'string'
    ? [p.art, p.farbe ?? '', p.muster ?? '', p.name ?? '', Array.isArray(p.zubehoer) ? p.zubehoer : []]
    : 0;

  const fp = istObjekt(d.fortschritt) ? d.fortschritt : {};
  const rohRegeln = [];
  const alleTage = new Set();
  for (const [id, r] of Object.entries(istObjekt(fp.regeln) ? fp.regeln : {})) {
    if (!istObjekt(r)) continue;
    const tage = new Map();
    for (const [datum, tag] of Object.entries(istObjekt(r.teile) ? r.teile : {})) {
      const n = tagNummer(datum);
      const m = maskeVon(tag);
      if (n === null || !m) continue;
      tage.set(n, (tage.get(n) ?? 0) | m);
      alleTage.add(n);
    }
    rohRegeln.push([id, r.geschichteGesehen ? 1 : 0, tage]);
  }
  const tagListe = [...alleTage].sort((a, b) => a - b);
  let vorher = 0;
  const kalender = tagListe
    .map((n) => {
      const s = (n - vorher).toString(36);
      vorher = n;
      return s;
    })
    .join('.');
  const regeln = {};
  for (const [id, g, tage] of rohRegeln) {
    const masken = tagListe.map((n) => (tage.get(n) ?? 0).toString(16)).join('').replace(/0+$/, '');
    if (g || masken) regeln[id] = [g, masken];
  }

  const ueberraschungen = Array.isArray(fp.ueberraschungen) ? fp.ueberraschungen.filter((u) => typeof u === 'string') : [];

  const detektiv = {};
  for (const [id, datum] of Object.entries(istObjekt(fp.detektiv) ? fp.detektiv : {})) {
    const n = tagNummer(datum);
    if (n !== null) detektiv[id] = n.toString(36);
  }

  const album = {};
  for (const [key, pos] of Object.entries(istObjekt(d.album) ? d.album : {})) {
    if (istObjekt(pos) && Number.isFinite(pos.x) && Number.isFinite(pos.y)) album[key] = [Math.round(pos.x), Math.round(pos.y)];
  }

  return [profil, kalender, regeln, ueberraschungen, detektiv, album];
}

/** { profil, fortschritt, album } → 'BRM1:…' (async wegen Kompression). */
export async function kodieren(daten) {
  const bytes = new TextEncoder().encode(JSON.stringify(kompakt(daten)));
  if (kompressionDa()) return `${PRAEFIX}z${zuBase64url(await durchStrom(bytes, new CompressionStream('deflate-raw')))}`;
  return `${PRAEFIX}j${zuBase64url(bytes)}`;
}

// ---------- Dekodieren ----------

const KAPUTT = 'Der Code ist beschädigt oder unvollständig. Bitte noch einmal übertragen.';

function auspacken(k) {
  if (!Array.isArray(k) || k.length < 6) throw fehler(KAPUTT);
  const [p, kalenderK, regelnK, uebK, detK, albumK] = k;

  let profil = null;
  if (Array.isArray(p) && typeof p[0] === 'string' && typeof p[3] === 'string') {
    profil = { art: p[0], farbe: String(p[1] ?? ''), muster: String(p[2] ?? ''), name: p[3], zubehoer: Array.isArray(p[4]) ? p[4].filter((z) => typeof z === 'string') : [] };
  }

  if (typeof kalenderK !== 'string' || !istObjekt(regelnK) || !Array.isArray(uebK) || !istObjekt(detK) || !istObjekt(albumK)) throw fehler(KAPUTT);

  let n = 0;
  const kalender = (kalenderK ? kalenderK.split('.') : []).map((s) => {
    const delta = parseInt(s, 36);
    if (!/^-?[0-9a-z]+$/.test(s) || !Number.isFinite(delta)) throw fehler(KAPUTT);
    n += delta;
    return datumAusNummer(n);
  });

  const regeln = {};
  for (const [id, eintrag] of Object.entries(regelnK)) {
    if (!Array.isArray(eintrag) || typeof eintrag[1] !== 'string' || !/^[0-9a-f]*$/.test(eintrag[1]) || eintrag[1].length > kalender.length) throw fehler(KAPUTT);
    const teile = {};
    [...eintrag[1]].forEach((z, i) => {
      const maske = parseInt(z, 16);
      if (maske) teile[kalender[i]] = tagVonMaske(maske);
    });
    regeln[id] = { geschichteGesehen: !!eintrag[0], teile };
  }

  const detektiv = {};
  for (const [id, wert] of Object.entries(detK)) {
    const n = parseInt(wert, 36);
    if (!Number.isFinite(n)) throw fehler(KAPUTT);
    detektiv[id] = datumAusNummer(n);
  }

  const album = {};
  for (const [key, pos] of Object.entries(albumK)) {
    if (!Array.isArray(pos) || !Number.isFinite(pos[0]) || !Number.isFinite(pos[1])) throw fehler(KAPUTT);
    album[key] = { x: pos[0], y: pos[1] };
  }

  const fortschritt = { ...leererFortschritt(), regeln, ueberraschungen: uebK.filter((u) => typeof u === 'string') };
  if (Object.keys(detektiv).length) fortschritt.detektiv = detektiv;
  return { profil, fortschritt, album };
}

/** 'BRM1:…' → { profil, fortschritt, album }. Wirft einen verständlichen deutschen Fehler. */
export async function dekodieren(text) {
  const t = String(text ?? '').replace(/\s+/g, '');
  if (!t) throw fehler('Es wurde kein Code gefunden.');
  if (/^BRM\d+:/.test(t) && !t.startsWith(PRAEFIX)) throw fehler('Dieser Code stammt aus einer anderen App-Version. Bitte beide Geräte aktualisieren.');
  if (!t.startsWith(PRAEFIX)) throw fehler('Das ist kein Baderegel-Meister-Code.');
  const art = t[PRAEFIX.length];
  const rumpf = t.slice(PRAEFIX.length + 1);
  let bytes;
  try {
    bytes = ausBase64url(rumpf);
  } catch {
    throw fehler(KAPUTT);
  }
  if (art === 'z') {
    if (typeof DecompressionStream !== 'function') throw fehler('Dieses Gerät kann den Code nicht lesen. Bitte das Betriebssystem aktualisieren.');
    try {
      bytes = await durchStrom(bytes, new DecompressionStream('deflate-raw'));
    } catch {
      throw fehler(KAPUTT);
    }
  } else if (art !== 'j') {
    throw fehler(KAPUTT);
  }
  let roh;
  try {
    roh = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw fehler(KAPUTT);
  }
  return auspacken(roh);
}

// ---------- Zusammenführen ----------

function regelnVereinen(a = {}, b = {}) {
  const ergebnis = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const ra = istObjekt(a[id]) ? a[id] : {};
    const rb = istObjekt(b[id]) ? b[id] : {};
    const ta = istObjekt(ra.teile) ? ra.teile : {};
    const tb = istObjekt(rb.teile) ? rb.teile : {};
    const teile = {};
    for (const datum of [...new Set([...Object.keys(ta), ...Object.keys(tb)])].sort()) {
      const tag = {};
      for (const quelle of [ta[datum], tb[datum]]) {
        for (const [teil, wert] of Object.entries(istObjekt(quelle) ? quelle : {})) if (wert) tag[teil] = true;
      }
      teile[datum] = tag;
    }
    ergebnis[id] = { ...rb, ...ra, geschichteGesehen: !!(ra.geschichteGesehen || rb.geschichteGesehen), teile };
  }
  return ergebnis;
}

function detektivVereinen(a, b) {
  if (!istObjekt(a) && !istObjekt(b)) return undefined;
  const ergebnis = {};
  for (const quelle of [a, b]) {
    for (const [id, datum] of Object.entries(istObjekt(quelle) ? quelle : {})) {
      if (typeof datum !== 'string') continue;
      if (!ergebnis[id] || datum < ergebnis[id]) ergebnis[id] = datum;
    }
  }
  return ergebnis;
}

/** Anzahl (Regel, Datum)-Paare mit mindestens einem Teilerfolg. */
function uebungsTage(fp) {
  const tage = new Set();
  for (const r of Object.values(fp?.regeln ?? {})) {
    for (const [datum, tag] of Object.entries(r?.teile ?? {})) if (Object.values(tag ?? {}).some(Boolean)) tage.add(datum);
  }
  return tage;
}

/**
 * Führt zwei Stände verlustfrei zusammen.
 * lokal/fremd: { profil, fortschritt, album }
 * optionen: { ordenAnzahl?: (fp) => number } – für die Zusammenfassung „Orden vorher → nachher“.
 * Rückgabe: { profil, fortschritt, album, zusammenfassung }
 */
export function zusammenfuehren(lokal, fremd, optionen = {}) {
  const l = kopie(lokal) ?? {};
  const f = kopie(fremd) ?? {};
  const lfp = istObjekt(l.fortschritt) ? l.fortschritt : leererFortschritt();
  const ffp = istObjekt(f.fortschritt) ? f.fortschritt : leererFortschritt();

  const lUeb = Array.isArray(lfp.ueberraschungen) ? lfp.ueberraschungen : [];
  const fUeb = Array.isArray(ffp.ueberraschungen) ? ffp.ueberraschungen : [];
  const fortschritt = {
    ...ffp,
    ...lfp,
    regeln: regelnVereinen(lfp.regeln, ffp.regeln),
    ueberraschungen: [...new Set([...lUeb, ...fUeb])],
  };
  const detektiv = detektivVereinen(lfp.detektiv, ffp.detektiv);
  if (detektiv) fortschritt.detektiv = detektiv;
  else delete fortschritt.detektiv;

  const profil = istObjekt(l.profil) ? l.profil : istObjekt(f.profil) ? f.profil : null;
  const album = { ...(istObjekt(f.album) ? f.album : {}), ...(istObjekt(l.album) ? l.album : {}) };

  const tageVorher = uebungsTage(lfp);
  const tageNachher = uebungsTage(fortschritt);
  const zaehlOrden = optionen.ordenAnzahl;
  const zusammenfassung = {
    ordenVorher: zaehlOrden ? zaehlOrden(lfp) : null,
    ordenNachher: zaehlOrden ? zaehlOrden(fortschritt) : null,
    neueTage: [...tageNachher].filter((d) => !tageVorher.has(d)).length,
    neueTeilerfolge: zaehleTeile(fortschritt) - zaehleTeile(lfp),
    neueUeberraschungen: fortschritt.ueberraschungen.filter((u) => !lUeb.includes(u)),
    neueGeschichten: Object.keys(fortschritt.regeln).filter((id) => fortschritt.regeln[id].geschichteGesehen && !lfp.regeln?.[id]?.geschichteGesehen).length,
    neueDetektiv: Object.keys(detektiv ?? {}).filter((id) => !lfp.detektiv?.[id]),
    profilUebernommen: !istObjekt(l.profil) && !!profil,
  };
  zusammenfassung.nichtsNeu =
    !zusammenfassung.neueTeilerfolge && !zusammenfassung.neueUeberraschungen.length && !zusammenfassung.neueGeschichten &&
    !zusammenfassung.neueDetektiv.length && !zusammenfassung.profilUebernommen;

  return { profil, fortschritt, album, zusammenfassung };
}

function zaehleTeile(fp) {
  let n = 0;
  for (const r of Object.values(fp?.regeln ?? {})) {
    for (const tag of Object.values(r?.teile ?? {})) n += Object.values(tag ?? {}).filter(Boolean).length;
  }
  return n;
}
