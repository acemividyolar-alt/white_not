/* ==========================================================================
   White Note — çevrimdışı çalışma (service worker)
   - Sayfa (index.html): önce internetten alınır, böylece güncel sürüm gelir;
     internet yoksa son kaydedilen kopya açılır.
   - Simgeler ve yazı tipleri: önce cihazdaki kopya, arkada tazelenir.
   - SQLite motoru (sql.js, internetten bir kez iner): indikten sonra cihazda saklanır,
     böylece şema konsolu ve .db dışa aktarma internetsiz de çalışır.
   - Firebase kütüphanesi (ekip modu, internetten bir kez iner): aynı şekilde cihazda saklanır,
     böylece ekip alanı da internetsiz açılır.
   Notların kendisi burada değil: kişisel alan tarayıcının yerel deposunda (localStorage),
   ekip alanı Firebase'in cihazdaki kopyasında (IndexedDB) durur.
   ========================================================================== */
const CACHE = 'white-note-v2';
const CORE = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png',
  './fonts/recursive-latin.woff2', './fonts/recursive-latin-ext.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('white-note-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function put(req, res) {
  const copy = res.clone();
  caches.open(CACHE).then(c => c.put(req, copy));
  return res;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Sayfanın kendisi: önce internet, yoksa kayıtlı kopya
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => (res.ok ? put('./index.html', res) : res))
        .catch(() => caches.match('./index.html').then(hit => hit || caches.match('./')))
    );
    return;
  }

  // SQLite motoru ve Firebase kütüphanesi: adreslerinde sürüm numarası var, değişmez; önce cihazdaki kopya
  if (/\/sql\.js[@/]|sql-wasm\.(js|wasm)/.test(url.href) || /^https:\/\/www\.gstatic\.com\/firebasejs\/\d+\.\d+\.\d+\//.test(url.href)) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => (res.ok || res.type === 'opaque' ? put(req, res) : res)))
    );
    return;
  }

  // Bu sitedeki diğer dosyalar: cihazdaki kopya hemen, internetten arkada tazele
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(res => (res.ok ? put(req, res) : res)).catch(() => hit);
        return hit || net;
      })
    );
  }
});
