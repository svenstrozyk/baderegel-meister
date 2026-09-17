// Service Worker (injectManifest): Precache für Offline-Betrieb.
// Audio läuft über eine eigene Route VOR dem Precache: Safari/iOS fordert Medien mit Range-Header an
// und erwartet eine Teilantwort (206) – der Precache allein liefert immer die ganze Datei (200).
import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { createPartialResponse } from 'workbox-range-requests';
import { clientsClaim } from 'workbox-core';

self.skipWaiting();
clientsClaim();

registerRoute(
  ({ url }) => url.pathname.endsWith('.m4a'),
  async ({ request }) => {
    const gespeichert = await matchPrecache(request.url);
    if (!gespeichert) return fetch(request);
    return request.headers.has('range') ? createPartialResponse(request, gespeichert) : gespeichert;
  },
);

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
