# Baderegel-Meister

Lern-App (PWA, fürs iPad gedacht) für Vorschulkinder, die für das Seepferdchen die Baderegeln lernen – ohne lesen zu können.
Eltern und Kind spielen gemeinsam: Geschichten, „Welche Regel?“, „Warum?“, „Richtig oder falsch?“, Trainer-Modus und Detektiv-Suchbilder.
Ein selbst gestaltetes Partner-Wassermonster begleitet das Kind, Sammelkarten und Orden zeigen den Lernfortschritt.

**App:** https://svenstrozyk.github.io/baderegel-meister/ – in Safari öffnen, „Zum Home-Bildschirm“, dann offline nutzbar.

- Inhalte: `content/` (Regeln nach den DLRG-Baderegeln, kindgerecht formuliert)
- Konzept und Entscheidungen: `docs/konzept.md`
- Illustrationen: OpenAI gpt-image-2, Stimmen: OpenAI gpt-4o-mini-tts
- Kein Konto, kein Tracking – der Fortschritt bleibt lokal auf dem Gerät.

```bash
npm install
npm run dev     # Entwicklung (im WLAN erreichbar)
npm test        # Fortschrittslogik
npm run build   # Produktionsbuild nach dist/
```
