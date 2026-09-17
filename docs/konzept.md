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
- Kein Fehler-Buzzer, keine Zeitlimits, keine Streaks, keine Zufallsbelohnungen für Nichtstun

## Modi (Version 1)

| Modus | Zweck | Stufe |
|---|---|---|
| A · Geschichte + Geste | Regel einführen (3 Bilder, Erzählung, Geste nachmachen) | – |
| B · Richtig oder falsch? | Situation einschätzen | Einschätzen |
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
- Monster als geriggte **SVG** (einfärbbar, Gesten, Entwicklung)
- Szenen-Illustrationen per **OpenAI Bild-API** (Anime-/Monster-Comic-Stil), vom Agenten generiert und visuell geprüft
- Audio: vorgerenderte Dateien – Prototyp **macOS „Anna“**, Endfassung **OpenAI TTS** (gpt-4o-mini-tts: Erzähler „ballad“, Monster „sage“); Monstername live per iPad-Sprachausgabe
- Hosting: lokal + git, nach Prototyp **GitHub Pages**
- Keine personenbezogenen Daten im Repo

## Phasen

0. Inhalte: Regeln, Geschichten, Situationen, Warum-Fragen, Bildprompts, Monster-Spezifikation ← *aktuell*
1. Prototyp mit 2 Regeln (Gewitter, Springen) + Monster-Baukasten + Karten + Modi A–D → Test mit Kind
2. Alle 10 Regeln, Elternbereich, Urkunde
3. Hörmodus E, Druckkarten, OpenAI-Stimmen
