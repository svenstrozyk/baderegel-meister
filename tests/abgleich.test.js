import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kodieren, dekodieren, zusammenfuehren, tagNummer, datumAusNummer, PRAEFIX } from '../src/lib/state/abgleich.js';
import { ordenAnzahl, TEILE } from '../src/lib/state/fortschritt.js';

// Kleiner deterministischer Zufallsgenerator für synthetische Daten
function zufall(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/**
 * 10 Regeln × 40 Übungstage (verteilt über ~5 Monate), zufällige Teilerfolge je Regel und Tag.
 * gemeinsamerKalender: alle Regeln an denselben 40 Tagen geübt (realistisch: Übungstage der Familie);
 * sonst hat jede Regel eigene Tage (ungünstigster Fall).
 */
function vielDaten({ gemeinsamerKalender = true } = {}) {
  const r = zufall(42);
  const tageListe = () => {
    let tag = tagNummer('2026-03-01');
    return Array.from({ length: 40 }, () => (tag += 1 + Math.floor(r() * 4)));
  };
  const gemeinsam = tageListe();
  const regeln = {};
  for (let id = 1; id <= 10; id++) {
    const teile = {};
    for (const tag of gemeinsamerKalender ? gemeinsam : tageListe()) {
      const eintrag = {};
      for (const t of TEILE) if (r() < 0.6) eintrag[t] = true;
      if (!Object.keys(eintrag).length) eintrag.kennen = true;
      teile[datumAusNummer(tag)] = eintrag;
    }
    regeln[id] = { geschichteGesehen: true, teile };
  }
  const album = {};
  for (let id = 1; id <= 10; id++) album[`regel-${id}`] = { x: r() * 90, y: r() * 80 };
  for (const u of ['ente', 'qualle', 'seestern']) album[`ueberraschung-${u}`] = { x: r() * 90, y: r() * 80 };
  return {
    profil: { art: 'plitsch', farbe: 'tuerkis', muster: 'punkte', name: 'Blubberbert', zubehoer: ['muetze', 'brille'] },
    fortschritt: {
      regeln,
      ueberraschungen: ['ente', 'qualle', 'seestern', 'muschel', 'krebs', 'fisch'],
      detektiv: { freibad: '2026-04-02', badesee: '2026-05-11', gewitter: '2026-06-20' },
    },
    album,
  };
}

const KLEIN = {
  profil: { art: 'kiesel', farbe: 'rot', muster: 'streifen', name: 'Kiki', zubehoer: [] },
  fortschritt: {
    regeln: {
      1: { geschichteGesehen: true, teile: { '2026-09-01': { kennen: true, trainer: true }, '2026-09-03': { situationen: true } } },
      5: { geschichteGesehen: false, teile: { '2025-12-30': { warum: true } } },
    },
    ueberraschungen: ['ente'],
    detektiv: { freibad: '2026-09-02' },
  },
  album: { 'regel-1': { x: 12.4, y: 70.6 } },
};

test('Datum ↔ Tagnummer', () => {
  assert.equal(tagNummer('2026-01-01'), 0);
  assert.equal(tagNummer('2026-03-01'), 59);
  assert.equal(tagNummer('2025-12-31'), -1);
  assert.equal(tagNummer('2026-02-30'), null);
  assert.equal(tagNummer('quatsch'), null);
  for (const d of ['2026-01-01', '2027-02-28', '2028-02-29', '2025-06-15']) assert.equal(datumAusNummer(tagNummer(d)), d);
});

test('kodieren → dekodieren: Rundreise (inkl. Datum vor 2026, Album gerundet)', async () => {
  const code = await kodieren(KLEIN);
  assert.ok(code.startsWith(PRAEFIX));
  const zurueck = await dekodieren(`  \n${code}\n `);
  assert.deepEqual(zurueck.profil, KLEIN.profil);
  assert.deepEqual(zurueck.fortschritt.regeln, KLEIN.fortschritt.regeln);
  assert.deepEqual(zurueck.fortschritt.ueberraschungen, ['ente']);
  assert.deepEqual(zurueck.fortschritt.detektiv, { freibad: '2026-09-02' });
  assert.deepEqual(zurueck.album, { 'regel-1': { x: 12, y: 71 } });
});

test('Rundreise mit leerem Stand (kein Profil)', async () => {
  const zurueck = await dekodieren(await kodieren({ profil: null, fortschritt: { regeln: {}, ueberraschungen: [] }, album: {} }));
  assert.deepEqual(zurueck, { profil: null, fortschritt: { regeln: {}, ueberraschungen: [] }, album: {} });
});

test('Code bleibt auch nach Monaten klein (10 Regeln × 40 Tage < 900 Zeichen)', async () => {
  for (const gemeinsamerKalender of [true, false]) {
    const daten = vielDaten({ gemeinsamerKalender });
    const code = await kodieren(daten);
    console.log(`  Codelänge 10 Regeln × 40 Tage (${gemeinsamerKalender ? 'gemeinsame Übungstage' : 'je Regel eigene Tage'}): ${code.length} Zeichen, JSON roh ${JSON.stringify(daten).length}`);
    if (gemeinsamerKalender) assert.ok(code.length < 900, `Code zu lang: ${code.length}`);
    else assert.ok(code.length < 1400, `Code zu lang: ${code.length}`);
    const zurueck = await dekodieren(code);
    assert.deepEqual(zurueck.fortschritt.regeln, daten.fortschritt.regeln);
    assert.deepEqual(zurueck.fortschritt.detektiv, daten.fortschritt.detektiv);
    assert.deepEqual(zurueck.profil, daten.profil);
  }
});

test('dekodieren: verständliche Fehler bei falschem/kaputtem Code', async () => {
  await assert.rejects(dekodieren(''), /kein Code/);
  await assert.rejects(dekodieren('https://example.com'), /kein Baderegel-Meister-Code/);
  await assert.rejects(dekodieren('BRM9:zabc'), /anderen App-Version/);
  await assert.rejects(dekodieren('BRM1:z!!!'), /beschädigt/);
  await assert.rejects(dekodieren('BRM1:zAAAAAAAA'), /beschädigt/);
  await assert.rejects(dekodieren('BRM1:x'), /beschädigt/);
  const code = await kodieren(KLEIN);
  await assert.rejects(dekodieren(code.slice(0, Math.floor(code.length / 2))), /beschädigt/);
  // gültiges JSON, falsche Form
  const falsch = `${PRAEFIX}j${Buffer.from('{"a":1}').toString('base64url')}`;
  await assert.rejects(dekodieren(falsch), /beschädigt/);
});

const A = {
  profil: { art: 'plitsch', farbe: 'blau', muster: 'uni', name: 'Plitschi', zubehoer: [] },
  fortschritt: {
    regeln: {
      1: { geschichteGesehen: true, teile: { '2026-09-01': { kennen: true } } },
      2: { geschichteGesehen: false, teile: { '2026-09-02': { situationen: true } } },
    },
    ueberraschungen: ['ente', 'krebs'],
    detektiv: { freibad: '2026-09-05' },
  },
  album: { 'regel-1': { x: 10, y: 10 } },
};
const B = {
  profil: { art: 'pingo', farbe: 'gelb', muster: 'uni', name: 'Pingo', zubehoer: [] },
  fortschritt: {
    regeln: {
      1: { geschichteGesehen: false, teile: { '2026-09-01': { trainer: true }, '2026-09-04': { kennen: true, trainer: true } } },
      3: { geschichteGesehen: true, teile: {} },
    },
    ueberraschungen: ['qualle', 'ente'],
    detektiv: { freibad: '2026-09-03', badesee: '2026-09-04' },
  },
  album: { 'regel-1': { x: 50, y: 50 }, 'regel-3': { x: 20, y: 30 } },
};

test('zusammenfuehren: Vereinigung ohne Datenverlust', () => {
  const m = zusammenfuehren(A, B, { ordenAnzahl: (fp) => ordenAnzahl(fp, [1, 2, 3]) });
  assert.deepEqual(m.fortschritt.regeln[1], {
    geschichteGesehen: true,
    teile: { '2026-09-01': { kennen: true, trainer: true }, '2026-09-04': { kennen: true, trainer: true } },
  });
  assert.deepEqual(m.fortschritt.regeln[2], A.fortschritt.regeln[2]);
  assert.deepEqual(m.fortschritt.regeln[3], { geschichteGesehen: true, teile: {} });
  assert.deepEqual(m.fortschritt.ueberraschungen, ['ente', 'krebs', 'qualle']);
  assert.deepEqual(m.fortschritt.detektiv, { freibad: '2026-09-03', badesee: '2026-09-04' });
  assert.deepEqual(m.profil, A.profil, 'lokales Profil bleibt');
  assert.deepEqual(m.album, { 'regel-1': { x: 10, y: 10 }, 'regel-3': { x: 20, y: 30 } }, 'lokale Positionen gewinnen');
  assert.equal(m.zusammenfassung.neueTage, 1);
  assert.equal(m.zusammenfassung.neueTeilerfolge, 3);
  assert.deepEqual(m.zusammenfassung.neueUeberraschungen, ['qualle']);
  assert.equal(m.zusammenfassung.neueGeschichten, 1);
  assert.deepEqual(m.zusammenfassung.neueDetektiv, ['badesee']);
  assert.equal(m.zusammenfassung.ordenVorher, 0);
  assert.equal(m.zusammenfassung.ordenNachher, 0);
  assert.equal(m.zusammenfassung.nichtsNeu, false);
  // Eingaben bleiben unverändert
  assert.deepEqual(A.fortschritt.regeln[1].teile, { '2026-09-01': { kennen: true } });
});

test('zusammenfuehren: Profil vom anderen Gerät, wenn lokal keins', () => {
  const m = zusammenfuehren({ ...A, profil: null }, B);
  assert.deepEqual(m.profil, B.profil);
  assert.equal(m.zusammenfassung.profilUebernommen, true);
});

test('zusammenfuehren: idempotent', () => {
  const einmal = zusammenfuehren(A, B);
  const zweimal = zusammenfuehren(einmal, B);
  assert.deepEqual(zweimal.fortschritt, einmal.fortschritt);
  assert.deepEqual(zweimal.album, einmal.album);
  assert.deepEqual(zweimal.profil, einmal.profil);
  assert.equal(zweimal.zusammenfassung.nichtsNeu, true);
  assert.equal(zweimal.zusammenfassung.neueTage, 0);
  assert.deepEqual(zusammenfuehren(A, A).fortschritt, zusammenfuehren(A, {}).fortschritt);
});

test('zusammenfuehren: kommutativ für den Fortschritt', () => {
  const ab = zusammenfuehren(A, B).fortschritt;
  const ba = zusammenfuehren(B, A).fortschritt;
  assert.deepEqual({ ...ab, ueberraschungen: [...ab.ueberraschungen].sort() }, { ...ba, ueberraschungen: [...ba.ueberraschungen].sort() });
});

test('zusammenfuehren: Orden entstehen erst durch die Vereinigung', async () => {
  // Gerät A: Tag 1 komplett, Gerät B: Tag 2 komplett → zusammen 2 Tage = Orden
  const tag = { kennen: true, warum: true, trainer: true, situationen: true };
  const a = { profil: null, fortschritt: { regeln: { 4: { geschichteGesehen: true, teile: { '2026-09-10': tag } } }, ueberraschungen: [] }, album: {} };
  const b = { profil: null, fortschritt: { regeln: { 4: { geschichteGesehen: true, teile: { '2026-09-12': tag } } }, ueberraschungen: [] }, album: {} };
  const fremd = await dekodieren(await kodieren(b));
  const m = zusammenfuehren(a, fremd, { ordenAnzahl: (fp) => ordenAnzahl(fp, [4]) });
  assert.equal(m.zusammenfassung.ordenVorher, 0);
  assert.equal(m.zusammenfassung.ordenNachher, 1);
});
