# Baderegel-Meister – Konzept & Entscheidungen

Lern-App (iPad) für einen 5-jährigen Nicht-Leser, der im Seepferdchen-Kurs die Baderegeln lernt.
Eltern und Kind nutzen die App gemeinsam; mindestens die Hälfte des Lernens passiert offline.

## Lernziele (pro Regel)

1. **Kennen** – Regel zu Symbol/Situation nennen
2. **Verstehen** – wissen, *warum* es die Regel gibt
3. **Einschätzen** – Situationen richtig beurteilen

Keine klassische Prüfung im Kurs – alle drei Ziele zählen gleich.

## Didaktische Leitlinien

- Enaktiv → ikonisch → symbolisch: Geste + Symbol vor Satz
- Abruf statt Vorlesen; verteilte Wiederholung (Stufe zählt erst nach Erfolg an 2 verschiedenen Tagen)
- Warum-Erklärungen in Kindersprache, positive Formulierungen, keine Angstbilder (Moment *vor* der Gefahr zeigen, nie Unfälle)
- Kind als Lehrer (Rollentausch), gemeinsame Nutzung mit Eltern
- Sitzungen ≤ 7 Minuten, bewusster Abschluss
- Sitzung abbrechen nur nach Rückfrage; schon Erreichtes wird trotzdem am Ende gefeiert
- Kein Fehler-Buzzer, keine Zeitlimits, keine Streaks, keine Zufallsbelohnungen für Nichtstun

## Modi (Version 1)

| Modus | Zweck | Stufe |
|---|---|---|
| A · Geschichte + Geste | Regel einführen (3 Bilder, Erzählung, Geste nachmachen) | – |
| B · Richtig oder falsch? | Situation einschätzen; nach „Daumen runter“-Situationen Anschlussfrage „Welche Regel hilft hier?“ (Raten allein reicht nicht) | Einschätzen (höchstens 1 Fehler pro Sitzung) |
| Gemischte Wiederholung | 1 Situation einer früher gelernten Regel pro Sitzung (verschränktes Üben) | zählt nicht |
| C · Regel-Detektiv | Wimmelbild, Verstöße finden | Wiederholung / Einschätzen |
| D · Ich bin der Trainer | Kind erklärt Regel + Warum, Eltern bestätigen | Kennen + Verstehen |
| „Welche Regel?“ / „Warum?“ | Symbol wählen / Bild-Antwort wählen | Kennen / Verstehen |
| E · Hörmodus | später | – |

## Theme „Wassermonster“ (Pokémon-inspiriert, eigene Figuren)

- Kind wählt 1 von 5 **Partner-Wassermonstern**, dann Farbe, Muster, Name (Eltern tippen Namen)
- Monster **entwickelt sich**: Stufe 2 bei 3 Orden, Stufe 3 bei 10 Orden
- Jede Regel = **Orden**; Orden gilt, wenn alle 3 Lernziele erreicht sind
- **Sammelkarten** pro Regel in 3 Stufen: normal (Kennen) → glitzernd (Verstehen) → gold (Einschätzen)
- **Baderegel-Dex / Album**: Karten antippen → Regel wird vorgelesen; Karten frei in Szene kleben
- Überraschungskarten (Ente, Qualle, …) selten, nur nach echtem Lernerfolg
- Zubehör freischaltbar – **keine Schwimmflügel/-ringe** (Regel 9)
- Architektur theme-fähig (später z. B. Dinos)
- Keine geschützten Pokémon-Inhalte (Repo ist öffentlich)

## Elternbereich

Eltern-Gate (3 s gedrückt halten), Fortschritt pro Regel und Lernziel, Tagesvorschlag, Gesprächsimpulse, Trainer-Bestätigung.

## Technik

- PWA (offline, installierbar auf iPad), kein Konto, kein Tracking, alles lokal (IndexedDB)
- Läuft auf iPad und iPhone (jeweils quer): Knöpfe und Abstände skalieren mit der Bildschirmhöhe (`src/lib/ui/masse.js`, `--skala`), Mindest-Tippfläche 56 px; auf dem iPhone rücken Detektiv- und Trainer-Leisten an die Seite
- Monster als geriggte **SVG** (einfärbbar, Gesten, Entwicklung)
- Szenen-Illustrationen per **OpenAI Bild-API** (Anime-/Monster-Comic-Stil), vom Agenten generiert und visuell geprüft
- Audio: vorgerenderte Dateien – Prototyp **macOS „Anna“**, Endfassung **OpenAI TTS** (gpt-4o-mini-tts: Erzähler „ballad“, Monster „sage“); Monstername live per iPad-Sprachausgabe
- Hosting: lokal + git, nach Prototyp **GitHub Pages**
- Keine personenbezogenen Daten im Repo
- Geräte-Abgleich (iPad ↔ iPhone) im Elternbereich ohne Konto/Server: komprimierter Code als QR (App scannt selbst), Zwischenablage oder Datei; Stände werden verlustfrei zusammengeführt

## Phasen

0. Inhalte: Regeln, Geschichten, Situationen, Warum-Fragen, Bildprompts, Monster-Spezifikation ← *aktuell*
1. Prototyp mit 2 Regeln (Gewitter, Springen) + Monster-Baukasten + Karten + Modi A–D → Test mit Kind
2. Alle 10 Regeln, Elternbereich, Urkunde
3. Hörmodus E, Druckkarten, OpenAI-Stimmen
