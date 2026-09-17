// Lokale Speicherung (localStorage) – robust gegen private Fenster / blockierten Speicher.
const SCHLUESSEL = 'baderegel-meister:v1';

export function laden() {
  try {
    const roh = localStorage.getItem(SCHLUESSEL);
    return roh ? JSON.parse(roh) : null;
  } catch {
    return null;
  }
}

export function speichern(daten) {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(daten));
    return true;
  } catch {
    return false;
  }
}

export function loeschen() {
  try {
    localStorage.removeItem(SCHLUESSEL);
  } catch {
    /* egal */
  }
}
