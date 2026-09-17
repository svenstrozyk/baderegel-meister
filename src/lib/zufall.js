export function mischen(liste, zufall = Math.random) {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const eins = (liste, zufall = Math.random) => liste[Math.floor(zufall() * liste.length)];
