// Service worker minimal : met en cache la coquille de l'app (index.html,
// logo) pour qu'elle s'ouvre encore hors-ligne. Les données du planning
// passent toujours par le réseau (Apps Script) pour rester à jour ;
// loadPlanning() gère déjà son propre repli via localStorage si le réseau
// est coupé.

const CACHE_NAME = "qgd-shell-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./logo-qgd.png",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // On ne met en cache que les fichiers de la coquille de l'app (même origine).
  // Les appels vers Google Sheets / Apps Script passent toujours par le réseau.
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
