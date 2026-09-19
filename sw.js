// CKT Global Webstore — Service Worker
// Fungsi: bolehkan app dipasang (installable) sebagai PWA, dan simpan salinan
// "app shell" (HTML/CSS/JS) supaya app tetap boleh dibuka walaupun internet
// terputus seketika. Data produk/pesanan sebenar tetap perlu internet
// (disimpan di Supabase), cuma bingkai app ni yang di-cache.

const CACHE_NAME = 'cktglobal-shell-v20';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategi: cache-first untuk fail app sendiri (HTML/CSS/JS), fallback ke
// network untuk semua permintaan lain (contoh: panggilan Supabase, imej,
// video). Ini pastikan data sentiasa terkini, hanya bingkai app yang cache.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isAppShellFile = isSameOrigin && (
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('index.html') ||
    url.pathname.endsWith('style.css') ||
    url.pathname.endsWith('app.js') ||
    url.pathname.endsWith('config.js') ||
    url.pathname.endsWith('manifest.json')
  );

  if (!isAppShellFile) return; // permintaan lain — biar browser uruskan terus, SW tak campur

  event.respondWith(
    (async () => {
      let cached;
      try { cached = await caches.match(event.request); } catch (e) { cached = undefined; }

      try {
        const response = await fetch(event.request);
        if (response && response.ok) {
          // Clone SEBAIK sahaja diterima, sebelum apa-apa operasi lain —
          // ini elak ralat "Response body is already used".
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      } catch (err) {
        // Network gagal (offline) — guna salinan cache jika ada
        if (cached) return cached;
        throw err;
      }
    })()
  );
});
