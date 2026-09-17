import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  szeneSpielbar, bildRechteck, punktImBild, trefferPruefen, alleFehlerGefunden, naechsterTipp, szeneGeloest, szeneLoesen,
} from '../src/lib/state/detektiv.js';
import { leererFortschritt, UEBERRASCHUNGEN, karteStufe } from '../src/lib/state/fortschritt.js';

// Testdaten (nicht die echten Inhalte)
const SZENE = {
  id: 'testbad',
  intro: 'Test',
  funde: [
    { id: 'a', regel: 5, art: 'fehler', text: 'A', bereich: { x: 20, y: 30, r: 10 } },
    { id: 'b', regel: 10, art: 'fehler', text: 'B', bereich: { x: 70, y: 60, r: 8 } },
    { id: 'c', regel: 1, art: 'richtig', text: 'C', bereich: { x: 50, y: 80, r: 6 } },
  ],
};

test('szeneSpielbar: gesperrt ohne Bild oder mit fehlendem Bereich', () => {
  assert.equal(szeneSpielbar(SZENE, true), true);
  assert.equal(szeneSpielbar(SZENE, false), false);
  const ohne = { ...SZENE, funde: [...SZENE.funde, { id: 'd', art: 'fehler', bereich: null }] };
  assert.equal(szeneSpielbar(ohne, true), false);
  assert.equal(szeneSpielbar({ id: 'leer', funde: [] }), false);
});

test('bildRechteck: Letterboxing bei object-fit contain (3:2)', () => {
  // zu breit → Ränder links/rechts
  assert.deepEqual(bildRechteck(1200, 600), { links: 150, oben: 0, breite: 900, hoehe: 600 });
  // zu hoch → Ränder oben/unten
  assert.deepEqual(bildRechteck(900, 800), { links: 0, oben: 100, breite: 900, hoehe: 600 });
  // exakt 3:2
  assert.deepEqual(bildRechteck(1500, 1000), { links: 0, oben: 0, breite: 1500, hoehe: 1000 });
});

test('punktImBild rechnet Container-px in Bild-% um und ignoriert den Rand', () => {
  const r = bildRechteck(1200, 600); // Bild 900×600 ab x=150
  assert.deepEqual(punktImBild(150 + 450, 300, r), { x: 50, y: 50 });
  assert.deepEqual(punktImBild(150, 0, r), { x: 0, y: 0 });
  assert.equal(punktImBild(100, 300, r), null); // linker schwarzer Rand
  assert.equal(punktImBild(1100, 300, r), null); // rechter Rand
});

test('trefferPruefen: Radius in % der Bildbreite, y mit Seitenverhältnis', () => {
  assert.equal(trefferPruefen(SZENE.funde, 20, 30).id, 'a');
  assert.equal(trefferPruefen(SZENE.funde, 29.5, 30).id, 'a'); // 9.5 % der Breite waagerecht
  assert.equal(trefferPruefen(SZENE.funde, 31, 30), null);
  // senkrecht: 10 % Breite = 15 % Höhe bei 3:2
  assert.equal(trefferPruefen(SZENE.funde, 20, 44).id, 'a');
  assert.equal(trefferPruefen(SZENE.funde, 20, 46), null);
  assert.equal(trefferPruefen(SZENE.funde, 90, 10), null);
  // Überlappung: näherer Mittelpunkt gewinnt
  const eng = [
    { id: 'x', bereich: { x: 40, y: 50, r: 10 } },
    { id: 'y', bereich: { x: 46, y: 50, r: 10 } },
  ];
  assert.equal(trefferPruefen(eng, 44, 50).id, 'y');
  assert.equal(trefferPruefen([{ id: 'z', bereich: null }], 10, 10), null);
});

test('alle Fehler gefunden: Richtig-Funde sind optional; Tipp zeigt nächsten offenen Fehler', () => {
  assert.equal(alleFehlerGefunden(SZENE, ['a']), false);
  assert.equal(naechsterTipp(SZENE, ['a']).id, 'b');
  assert.equal(alleFehlerGefunden(SZENE, ['a', 'b']), true);
  assert.equal(naechsterTipp(SZENE, ['a', 'b']), null);
});

test('szeneLoesen: merkt Szene, erste Lösung gibt sicher eine Überraschungskarte, keine Lernpunkte', () => {
  const fp = leererFortschritt();
  const r1 = szeneLoesen(fp, 'testbad', '2026-09-17');
  assert.equal(r1.ersteMal, true);
  assert.equal(r1.karte.id, UEBERRASCHUNGEN[0].id);
  assert.equal(szeneGeloest(r1.fortschritt, 'testbad'), true);
  assert.deepEqual(r1.fortschritt.ueberraschungen, [UEBERRASCHUNGEN[0].id]);
  assert.equal(szeneGeloest(fp, 'testbad'), false); // unverändert
  assert.equal(karteStufe(r1.fortschritt, 5), 0);

  const r2 = szeneLoesen(r1.fortschritt, 'testbad', '2026-09-18');
  assert.equal(r2.ersteMal, false);
  assert.equal(r2.karte, null);
  assert.equal(r2.fortschritt.detektiv.testbad, '2026-09-17');

  const r3 = szeneLoesen(r1.fortschritt, 'zweite', '2026-09-18');
  assert.equal(r3.karte.id, UEBERRASCHUNGEN[1].id);

  // alle Karten schon gesammelt → gelöst, aber keine weitere Karte
  const voll = { ...leererFortschritt(), ueberraschungen: UEBERRASCHUNGEN.map((u) => u.id) };
  const r4 = szeneLoesen(voll, 'testbad', '2026-09-17');
  assert.equal(r4.ersteMal, true);
  assert.equal(r4.karte, null);
});
