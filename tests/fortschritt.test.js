import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  leererFortschritt, meldeErfolg, erfolgsTage, zielErreicht, karteStufe, hatOrden, ordenAnzahl,
  entwicklungsStufe, freiesZubehoer, bilanz, vergleich, ueberraschungVergeben, heuteDran, datumVon,
  markiereGeschichte, UEBERRASCHUNGEN, angefangeneZiele, zielStaende,
} from '../src/lib/state/fortschritt.js';

const ENTWICKLUNG = { stufe_2_ab_orden: 3, stufe_3_ab_orden: 10 };
const ZUBEHOER = [
  { id: 'taucherbrille', ab_orden: 1 }, { id: 'badekappe', ab_orden: 2 }, { id: 'handtuch_umhang', ab_orden: 4 },
  { id: 'sonnenhut', ab_orden: 6 }, { id: 'rettungspfeife', ab_orden: 8 },
];

const melde = (fp, id, teile, datum) => teile.reduce((f, t) => meldeErfolg(f, id, t, datum), fp);
const allesAn = (fp, id, datum) => melde(fp, id, ['kennen', 'warum', 'trainer', 'situationen'], datum);

test('datumVon nutzt lokales Datum', () => {
  assert.equal(datumVon(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('meldeErfolg ist unveränderlich', () => {
  const fp = leererFortschritt();
  const neu = meldeErfolg(fp, 7, 'kennen', '2026-09-17');
  assert.deepEqual(fp.regeln, {});
  assert.equal(neu.regeln[7].teile['2026-09-17'].kennen, true);
  assert.throws(() => meldeErfolg(fp, 7, 'quatsch', '2026-09-17'));
});

test('Kennen braucht Aufgabe UND Trainer am selben Tag', () => {
  let fp = meldeErfolg(leererFortschritt(), 7, 'kennen', '2026-09-17');
  assert.deepEqual(erfolgsTage(fp, 7, 'kennen'), []);
  fp = meldeErfolg(fp, 7, 'trainer', '2026-09-18'); // anderer Tag zählt nicht
  assert.deepEqual(erfolgsTage(fp, 7, 'kennen'), []);
  fp = meldeErfolg(fp, 7, 'trainer', '2026-09-17');
  assert.deepEqual(erfolgsTage(fp, 7, 'kennen'), ['2026-09-17']);
  assert.deepEqual(erfolgsTage(fp, 7, 'verstehen'), []);
});

test('2-Tage-Regel: ein Tag reicht nicht, zwei verschiedene Tage schon', () => {
  let fp = melde(leererFortschritt(), 10, ['kennen', 'trainer'], '2026-09-17');
  fp = melde(fp, 10, ['kennen', 'trainer'], '2026-09-17'); // gleicher Tag doppelt
  assert.equal(zielErreicht(fp, 10, 'kennen'), false);
  fp = melde(fp, 10, ['kennen', 'trainer'], '2026-09-18');
  assert.equal(zielErreicht(fp, 10, 'kennen'), true);
});

test('Testmodus: ein Tag reicht', () => {
  const fp = melde(leererFortschritt(), 10, ['situationen'], '2026-09-17');
  assert.equal(zielErreicht(fp, 10, 'einschaetzen'), false);
  assert.equal(zielErreicht(fp, 10, 'einschaetzen', { testmodus: true }), true);
});

test('Karten-Stufen und Orden', () => {
  let fp = leererFortschritt();
  assert.equal(karteStufe(fp, 7), 0);
  fp = melde(fp, 7, ['kennen', 'trainer'], '2026-09-17');
  fp = melde(fp, 7, ['kennen', 'trainer'], '2026-09-19');
  assert.equal(karteStufe(fp, 7), 1);
  fp = melde(fp, 7, ['warum'], '2026-09-17');
  fp = melde(fp, 7, ['warum'], '2026-09-19');
  assert.equal(karteStufe(fp, 7), 2);
  assert.equal(hatOrden(fp, 7), false);
  fp = melde(fp, 7, ['situationen'], '2026-09-17');
  fp = melde(fp, 7, ['situationen'], '2026-09-20');
  assert.equal(karteStufe(fp, 7), 3);
  assert.equal(hatOrden(fp, 7), true);
  assert.equal(ordenAnzahl(fp, [7, 10]), 1);
});

test('Entwicklung nach Orden (3 und 10)', () => {
  assert.equal(entwicklungsStufe(0, ENTWICKLUNG), 1);
  assert.equal(entwicklungsStufe(2, ENTWICKLUNG), 1);
  assert.equal(entwicklungsStufe(3, ENTWICKLUNG), 2);
  assert.equal(entwicklungsStufe(9, ENTWICKLUNG), 2);
  assert.equal(entwicklungsStufe(10, ENTWICKLUNG), 3);
});

test('Zubehör wird nach Orden freigeschaltet', () => {
  assert.deepEqual(freiesZubehoer(0, ZUBEHOER), []);
  assert.deepEqual(freiesZubehoer(2, ZUBEHOER), ['taucherbrille', 'badekappe']);
  assert.equal(freiesZubehoer(10, ZUBEHOER).length, 5);
});

test('Bilanz-Vergleich erkennt neue Stufen, Orden und Entwicklung', () => {
  const ids = [1, 2, 3, 7];
  let fp = leererFortschritt();
  for (const id of [1, 2]) fp = allesAn(fp, id, '2026-09-17');
  const vorher = bilanz(fp, ids, ENTWICKLUNG, { testmodus: true });
  assert.equal(vorher.orden, 2);
  assert.equal(vorher.entwicklung, 1);
  fp = allesAn(fp, 7, '2026-09-17');
  const nachher = bilanz(fp, ids, ENTWICKLUNG, { testmodus: true });
  const v = vergleich(vorher, nachher);
  assert.deepEqual(v.neueStufen, [{ regelId: 7, von: 0, zu: 3 }]);
  assert.deepEqual(v.neueOrden, [7]);
  assert.equal(v.entwickelt, true);
  assert.equal(v.entwicklungZu, 2);
});

test('Überraschungskarte nur nach Lernerfolg und selten', () => {
  const fp = leererFortschritt();
  assert.equal(ueberraschungVergeben(fp, 0, () => 0).karte, null); // kein Erfolg -> nie
  assert.equal(ueberraschungVergeben(fp, 1, () => 0.9).karte, null); // Pech
  const r = ueberraschungVergeben(fp, 1, () => 0);
  assert.equal(r.karte.id, UEBERRASCHUNGEN[0].id);
  assert.deepEqual(r.fortschritt.ueberraschungen, [UEBERRASCHUNGEN[0].id]);
  assert.deepEqual(fp.ueberraschungen, []);
  const r2 = ueberraschungVergeben(r.fortschritt, 1, () => 0);
  assert.notEqual(r2.karte.id, r.karte.id); // keine Doppelten
});

test('Heute dran: geringster Fortschritt, heute noch nicht geübt, ohne Orden', () => {
  let fp = leererFortschritt();
  assert.equal(heuteDran(fp, [7, 10], '2026-09-17'), 7);
  fp = meldeErfolg(fp, 7, 'kennen', '2026-09-17');
  assert.equal(heuteDran(fp, [7, 10], '2026-09-17'), 10);
  fp = allesAn(fp, 10, '2026-09-17');
  assert.equal(heuteDran(fp, [7, 10], '2026-09-17', { testmodus: true }), 7);
  fp = allesAn(fp, 7, '2026-09-17');
  assert.equal(heuteDran(fp, [7, 10], '2026-09-17', { testmodus: true }), 7);
  assert.equal(heuteDran(fp, [], '2026-09-17'), null);
});

test('Geschichte gesehen wird gemerkt', () => {
  const fp = markiereGeschichte(leererFortschritt(), 7);
  assert.equal(fp.regeln[7].geschichteGesehen, true);
});

test('angefangeneZiele: Erfolg an einem Tag leuchtet halb, zweiter Tag macht es fertig', () => {
  let fp = leererFortschritt();
  fp = meldeErfolg(fp, 7, 'situationen', '2026-09-17');
  assert.equal(angefangeneZiele(fp, 7), 1);
  assert.equal(karteStufe(fp, 7), 0);
  assert.equal(angefangeneZiele(fp, 7, { testmodus: true }), 0);
  fp = meldeErfolg(fp, 7, 'situationen', '2026-09-18');
  assert.equal(angefangeneZiele(fp, 7), 0);
  assert.equal(karteStufe(fp, 7), 1);
});

test('zielStaende: leer → halb (1 Tag) → voll (2 Tage), passend zu Kartenstufe', () => {
  const stand = (fp, o) => zielStaende(fp, 7, o).map((z) => z.stand);
  let fp = leererFortschritt();
  assert.deepEqual(zielStaende(fp, 7), [
    { ziel: 'kennen', tage: 0, stand: 'leer' },
    { ziel: 'verstehen', tage: 0, stand: 'leer' },
    { ziel: 'einschaetzen', tage: 0, stand: 'leer' },
  ]);
  fp = melde(fp, 7, ['kennen', 'trainer'], '2026-09-17');
  assert.deepEqual(stand(fp), ['halb', 'leer', 'leer']);
  assert.deepEqual(stand(fp, { testmodus: true }), ['voll', 'leer', 'leer']);
  fp = melde(fp, 7, ['kennen', 'trainer', 'warum'], '2026-09-18');
  assert.deepEqual(stand(fp), ['voll', 'halb', 'leer']);
  assert.equal(zielStaende(fp, 7)[0].tage, 2);
  // Kartenstufe = Anzahl voller Ziele
  assert.equal(karteStufe(fp, 7), stand(fp).filter((s) => s === 'voll').length);
  fp = melde(fp, 7, ['warum', 'trainer'], '2026-09-19');
  fp = melde(fp, 7, ['situationen'], '2026-09-19');
  fp = melde(fp, 7, ['situationen'], '2026-09-20');
  assert.deepEqual(stand(fp), ['voll', 'voll', 'voll']);
  assert.equal(hatOrden(fp, 7), true);
});

test('vergleich meldet veränderte Ziel-Stände (leer→halb, halb→voll)', () => {
  const ids = [7, 10];
  let fp = melde(leererFortschritt(), 7, ['situationen'], '2026-09-17');
  const vorher = bilanz(fp, ids, ENTWICKLUNG);
  fp = melde(fp, 7, ['situationen'], '2026-09-18');
  fp = melde(fp, 7, ['kennen', 'trainer'], '2026-09-18');
  const v = vergleich(vorher, bilanz(fp, ids, ENTWICKLUNG));
  assert.deepEqual(v.geaenderteZiele, [
    { regelId: 7, ziel: 'kennen', von: 'leer', zu: 'halb' },
    { regelId: 7, ziel: 'einschaetzen', von: 'halb', zu: 'voll' },
  ]);
  assert.deepEqual(v.neueStufen, [{ regelId: 7, von: 0, zu: 1 }]);
});
