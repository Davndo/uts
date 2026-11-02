// Service worker: semua aset di-cache saat instal, lalu dilayani offline (cache-first).
const CACHE = 'catatan-web-v7';
const ASET = ['./', './index.html', './manifest.json', './icon.svg'];
// Berkas OCR (mesin Tesseract + data bahasa). Dicache satu per satu agar kegagalan satu berkas tidak membatalkan instalasi.
const OCR = [
  './ocr/tesseract.min.js',
  './ocr/worker.min.js',
  './ocr/tesseract-core-simd-lstm.wasm.js',
  './ocr/tesseract-core-lstm.wasm.js',
  './ocr/lang/ind.traineddata.gz',
  './ocr/lang/eng.traineddata.gz'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASET).then(() => Promise.all(OCR.map((u) => c.add(u).catch(() => {})))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request)
        .then((res) => {
          if (res && res.ok && new URL(e.request.url).origin === location.origin) {
            const salinan = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, salinan));
          }
          return res;
        })
        .catch(() => (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()));
    })
  );
});
