const CACHE_NAME = "uts-dl-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./images/eval1_confusion.svg",
  "./images/lin1_xor.svg",
  "./images/training_flowchart.png",
  "./images/xor_three_lines.png",
  "./images/cnn_alur.svg",
  "./images/cnn_cara_kerja.svg",
  "./images/gan_arsitektur.svg",
  "./images/gan_dua_giliran.svg",
  "./images/gan_perkembangan_g.svg",
  "./images/gan_mode_collapse.svg",
  "./images/mlp_flatten.svg",
  "./images/ae_pilih_tipe.svg",
  "./images/ae_anomali.svg",
  "./images/ae_denoising.svg",
  "./images/ae_bentuk.svg",
  "./images/ae_alur.svg",
  "./images/ae_sparse.svg",
  "./images/ae_peta_latent.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var networkFetch = fetch(event.request).then(function (response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function () {
        return cached;
      });

      return cached || networkFetch;
    })
  );
});
