// Audio-Helfer: genau ein Audio gleichzeitig, iOS-Entsperrung per Nutzergeste, Sprachausgabe für Monsternamen.
const player = typeof Audio !== 'undefined' ? new Audio() : null;
let token = 0;
let beenden = null;

export const pfad = {
  app: (schluessel) => `audio/app/${schluessel}.m4a`,
  regel: (ordner, schluessel) => `audio/${ordner}/${schluessel}.m4a`,
  bild: (ordner, name) => `bilder/${ordner}/${name}.webp`,
};

/** Muss aus einem Tipp-Handler aufgerufen werden (iOS). */
export function entsperren() {
  if (!player) return;
  player.src = pfad.app('los');
  player.play().catch(() => {});
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  } catch {
    /* keine Sprachausgabe */
  }
}

/** Stoppt laufendes Audio und Sprachausgabe; offene spiele()-Promises lösen mit false auf. */
export function stoppe() {
  token++;
  if (player) {
    player.pause();
    player.removeAttribute('src');
    player.load();
  }
  beenden?.(false);
  beenden = null;
  try {
    speechSynthesis.cancel();
  } catch {
    /* egal */
  }
}

/** Spielt eine Datei; löst mit true (zu Ende) oder false (gestoppt/Fehler) auf. */
export function spiele(src) {
  stoppe();
  if (!player) return Promise.resolve(false);
  const meins = token;
  return new Promise((resolve) => {
    let erledigt = false;
    const beiEnde = () => fertig(true);
    const beiFehler = () => fertig(false);
    // Nur die eigenen Listener entfernen: ein verspätetes play()-Reject eines abgebrochenen
    // Aufrufs darf die Handler des nachfolgenden Aufrufs nicht löschen.
    const fertig = (ok) => {
      if (erledigt) return;
      erledigt = true;
      player.removeEventListener('ended', beiEnde);
      player.removeEventListener('error', beiFehler);
      if (beenden === fertig) beenden = null;
      resolve(ok && meins === token);
    };
    beenden = fertig;
    player.addEventListener('ended', beiEnde);
    player.addEventListener('error', beiFehler);
    player.src = src;
    player.play().catch(() => fertig(false));
  });
}

/** Spielt mehrere Dateien nacheinander; bricht ab, sobald etwas anderes startet. */
export async function spieleFolge(liste) {
  for (const src of liste) {
    if (!(await spiele(src))) return false;
  }
  return true;
}

/** Wartet ms Millisekunden (für kleine Pausen zwischen Ansagen). */
export const warte = (ms) => new Promise((r) => setTimeout(r, ms));

/** Live-Sprachausgabe (de-DE), z. B. für den Monsternamen. */
export function sprich(text) {
  stoppe();
  return new Promise((resolve) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-DE';
      u.rate = 0.95;
      u.pitch = 1.3;
      const stimme = speechSynthesis.getVoices().find((v) => v.lang?.replace('_', '-').startsWith('de'));
      if (stimme) u.voice = stimme;
      u.onend = () => resolve(true);
      u.onerror = () => resolve(false);
      speechSynthesis.speak(u);
    } catch {
      resolve(false);
    }
  });
}
