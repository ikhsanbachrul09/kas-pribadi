// Service worker sederhana untuk "Kas Pribadi".
// Tujuan utamanya cuma supaya kriteria PWA installable Chrome terpenuhi
// (perlu ada service worker terdaftar) dan halaman tetap bisa terbuka
// walau sedang tidak ada koneksi. Data transaksi TETAP butuh koneksi
// internet karena selalu diambil langsung dari Google Apps Script.

const CACHE_NAME = 'kas-pribadi-shell-v22';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);

  // Jangan sentuh permintaan ke Apps Script (data transaksi) -- selalu network.
  if (url.hostname.indexOf('script.google.com') !== -1 || url.hostname.indexOf('googleusercontent.com') !== -1) {
    return;
  }

  // App shell: coba cache dulu, fallback ke network.
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
