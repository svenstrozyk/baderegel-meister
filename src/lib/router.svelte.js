// Einfacher Zustands-Router ohne Bibliothek.
// Ansichten: start | onboarding | heimat | sitzung | album | orden | eltern | detektiv (Szenenwahl) | detektivSuche
import { stoppe } from './audio.js';

export const router = $state({ ansicht: 'start', params: {}, schritt: 0 });

export function gehe(ansicht, params = {}) {
  stoppe();
  router.ansicht = ansicht;
  router.params = params;
  router.schritt++;
}
