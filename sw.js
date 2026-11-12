/* ==========================================================================
   White Note — çevrimdışı çalışma (service worker)
   - Sayfa (index.html): önce internetten alınır, böylece güncel sürüm gelir;
     internet yoksa ya da site hata veriyorsa son kaydedilen kopya açılır.
   - Simgeler ve yazı tipleri: önce cihazdaki kopya, arkada tazelenir.
   - SQLite motoru (sql.js, internetten bir kez iner): indikten sonra cihazda saklanır,
     böylece şema konsolu ve .db dışa aktarma internetsiz de çalışır.
   - Firebase kütüphanesi (ekip modu, internetten bir kez iner): aynı şekilde cihazda saklanır,
     böylece ekip alanı da internetsiz açılır.
   Hatırlatma bildirimine dokununca uygulama öne gelir.
   Notların kendisi burada değil: kişisel alan tarayıcının yerel deposunda (localStorage),
   ekip alanı Firebase'in cihazdaki kopyasında (IndexedDB) durur.
   ========================================================================== */
const CACHE = 'white-note-v2';
const CORE = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-192.png', './icons/maskable-512.png', './icons/apple-touch-icon.png',
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

// Hatırlatma bildirimine dokununca uygulama öne gelir (kapalıysa açılır)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if (c.url.indexOf(self.registration.scope) === 0 && 'focus' in c) return c.focus();
    return self.clients.openWindow ? self.clients.openWindow('./') : null;
  }));
});

function put(req, res) {
  const copy = res.clone();
  caches.open(CACHE).then(c => c.put(req, copy));
  return res;
}
// Kayıtlı kopya yalnız bu uygulamanın önbelleğinde aranır (aynı sitedeki başka önbelleklere bakılmaz)
function kayitli(istek) { return caches.open(CACHE).then(c => c.match(istek)); }

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // White Note sunucusunun API'si (giriş, ekip kayıtları, canlı yayın) hiç önbelleğe girmez
  if (url.origin === self.location.origin && url.pathname.indexOf('/api/') !== -1) return;

  // Sayfanın kendisi: önce internet; internet yoksa ya da site hata veriyorsa kayıtlı kopya.
  // Yalnız uygulamanın sayfası (kapsamın kökü ya da index.html) böyle karşılanır: kapsamdaki başka bir dosya
  // (ör. manifest ya da bir simge) sekmede açılırsa kayıtlı sayfanın üstüne yazılmaz, olduğu gibi gösterilir.
  if (req.mode === 'navigate') {
    const kok = new URL(self.registration.scope).pathname;
    if (url.origin !== self.location.origin || (url.pathname !== kok && url.pathname !== kok + 'index.html')) return;
    const sayfa = () => kayitli('./index.html').then(hit => hit || kayitli('./'));
    event.respondWith(
      fetch(req).then(res => {
        if (res.ok) return put('./index.html', res);
        // Site hata veriyorsa (404, 5xx …) kayıtlı kopya açılır: notlar bu cihazda durur, erişilebilir kalsın.
        // Yönlendirmeler (status 0) olduğu gibi tarayıcıya bırakılır.
        return res.status >= 400 ? sayfa().then(hit => hit || res) : res;
      }).catch(sayfa)
    );
    return;
  }

  // SQLite motoru ve Firebase kütüphanesi: adreslerinde sürüm numarası var, değişmez; önce cihazdaki kopya
  if (/\/sql\.js[@/]|sql-wasm\.(js|wasm)/.test(url.href) || /^https:\/\/www\.gstatic\.com\/firebasejs\/\d+\.\d+\.\d+\//.test(url.href)) {
    event.respondWith(
      kayitli(req).then(hit => hit || fetch(req).then(res => (res.ok || res.type === 'opaque' ? put(req, res) : res)))
    );
    return;
  }

  // Bu sitedeki diğer dosyalar: cihazdaki kopya hemen, internetten arkada tazele
  if (url.origin === self.location.origin) {
    event.respondWith(
      kayitli(req).then(hit => {
        const net = fetch(req).then(res => (res.ok ? put(req, res) : res)).catch(() => hit);
        return hit || net;
      })
    );
  }
});
