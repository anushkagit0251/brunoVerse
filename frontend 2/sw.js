/* BrunoVerse service worker: makes the app installable and opens it even with a weak connection.
   API calls always go to the network; everything else is network-first with an offline copy. */
const CACHE = 'brunoverse-v1';
const SHELL = ['./', './index.html', './css/style.css', './assets/logo.svg', './manifest.webmanifest',
  './js/config.js', './js/icons.js', './js/store.js', './js/api.js', './js/geo.js', './js/ai.js', './js/ui.js',
  './js/pages-auth.js', './js/pages-owner.js', './js/pages-rescuer.js', './js/pages-shared.js', './js/pages-legal.js', './js/app.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  e.respondWith(
    fetch(e.request)
      .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
