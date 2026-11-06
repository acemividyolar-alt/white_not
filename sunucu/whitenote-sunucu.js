#!/usr/bin/env node
/* =====================================================================
   WHITE NOTE SUNUCUSU (Raspberry Pi için)
   Tek dosya, dış paket yok: Node.js 22+ (node:http, node:crypto, node:sqlite).

   Ne yapar:
     • Uygulamanın kendisini (index.html, simgeler, yazı tipleri) sunar. Sayfaya
       <meta name="wn-sunucu" content="1"> yazar: uygulama ekip alanını bu sunucuda açar.
     • Ekip alanı: kullanıcı adı + şifre (+ isteğe bağlı iki adımlı doğrulama / TOTP) ile giriş,
       ekipler, davet kodları, roller (sahip / yönetici / üye / okur)
     • Ekibin kayıtları SQLite'ta durur; değişiklikler herkesin ekranına anında gider (Server-Sent Events)
     • Her gece yedek (son 14 gün), giriş denemesi sınırı, ekip başına depolama sınırı,
       güvenlik başlıkları (CSP, HSTS …)

   Çalıştırma:
     node whitenote-sunucu.js                       sunucuyu başlatır (ayarlar: ortam değişkenleri, aşağıda)
     node whitenote-sunucu.js kullanici-ekle AD     yeni kullanıcı (şifre sorulur); --yonetici ile yönetici
     node whitenote-sunucu.js sifre-sifirla AD      şifreyi değiştirir, açık oturumları kapatır
     node whitenote-sunucu.js totp-kapat AD         iki adımlı doğrulamayı kapatır (telefon kaybolursa)
     node whitenote-sunucu.js kullanici-kapat AD    hesabı kapatır (giriş yapamaz, oturumları kapanır)
     node whitenote-sunucu.js kullanici-ac AD       kapatılan hesabı yeniden açar
     node whitenote-sunucu.js kullanicilar          kullanıcıları listeler
     node whitenote-sunucu.js yedek-al              hemen yedek alır
     node whitenote-sunucu.js geri-yukle DOSYA      yedeği geri yükler (önce sunucuyu durdur)

   Ayarlar (ortam değişkenleri):
     WN_PORT=8080          dinlenen bağlantı noktası
     WN_HOST=127.0.0.1     Cloudflare Tunnel aynı cihazdan bağlanır; dışarı açmak gerekmez
     WN_VERI=~/whitenote-veri   veritabanı ve yedeklerin klasörü (uygulama klasörünün DIŞINDA olmalı)
     WN_UYGULAMA=..        index.html'in olduğu klasör (bu dosya depodaki sunucu/ klasöründe durur)
     WN_VEKIL=cloudflare   gerçek ziyaretçi adresini CF-Connecting-IP başlığından al (yalnız tünel arkasında)
     WN_ADRES=https://whitenote.com.tr   sitenin adresi (Origin denetimi ve güvenli çerez için)
     WN_KOTA_MB=300, WN_KOTA_ADET=100000  bir ekibin depolama sınırı
     WN_GECMIS_MB=150      bir ekibin eski sürümleri (not geçmişi) için en fazla yer
   ===================================================================== */
'use strict';
const http = require('node:http');
const net = require('node:net');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
let DatabaseSync;
try { ({ DatabaseSync } = require('node:sqlite')); }
catch (e) {   // Node 22.13'ten eskisinde SQLite modülü yok (ya da bayrak ister)
  console.error('White Note sunucusu Node.js 22.13 ya da üstünü ister; bu makinede ' + process.version + ' var. Kurulum: sunucu/README.md');
  process.exit(1);
}

const AYAR = {
  port: +process.env.WN_PORT || 8080,
  host: process.env.WN_HOST || '127.0.0.1',
  veri: (process.env.WN_VERI || path.join(os.homedir(), 'whitenote-veri')).replace(/^~(?=$|\/)/, os.homedir()),
  uygulama: path.resolve(process.env.WN_UYGULAMA || path.join(__dirname, '..')),
  vekil: process.env.WN_VEKIL || '',
  adres: (process.env.WN_ADRES || '').replace(/\/+$/, '')
};
const SURUM = '2';
const GUN = 86400000;
const OTURUM_SURE = 30 * GUN;                 // giriş 30 gün hatırlanır (kullanıldıkça uzar)
const KAYIT_MAX = 1000000;                    // bir kayıt en fazla ~1 MB (uygulamadaki sınırla aynı)
const ISTEK_MAX = 8 * 1024 * 1024;            // bir istek gövdesi en fazla 8 MB
const KOTA_BOYUT = (+process.env.WN_KOTA_MB || 300) * 1024 * 1024;   // bir ekibin kayıtları toplam en fazla 300 MB
const KOTA_ADET = +process.env.WN_KOTA_ADET || 100000;                // ve en fazla 100 000 kayıt
const ANAHTAR = /^(proj|col|item|tbl|rel|sch|flc|fln|fle|fls|trash|yor):[A-Za-z0-9_-]{1,80}$/;
const GECMISLI = /^(proj|item|tbl):/;                    // eski sürümleri saklanan kayıtlar (not geçmişi)
const OLAYLI = /^(proj|col|item|tbl|flc|fln|yor):/;      // etkinlik geçmişinde görünen kayıtlar
const SURUM_MAX = 50;                                     // bir kaydın en fazla kaç eski sürümü saklanır
const GECMIS_BOYUT = (+process.env.WN_GECMIS_MB || 150) * 1024 * 1024;   // bir ekibin eski sürümleri toplam
const ROLLER = ['sahip', 'yonetici', 'uye', 'okur'];
const AD_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;  // kullanıcı adı: küçük harf, rakam, . _ -
const DAVET_RE = /^[A-Za-z0-9_-]{20,40}$/;
const VERITABANI = path.join(AYAR.veri, 'whitenote.db');

/* ---------- veritabanı ---------- */
fs.mkdirSync(AYAR.veri, { recursive: true, mode: 0o700 });
fs.mkdirSync(path.join(AYAR.veri, 'yedek'), { recursive: true, mode: 0o700 });
if ((path.resolve(AYAR.veri) + path.sep).startsWith(AYAR.uygulama + path.sep)) {
  console.error('WN_VERI uygulama klasörünün içinde olamaz (veritabanı internete açılırdı).');
  process.exit(1);
}
let db;
function veritabaniAc() {
  db = new DatabaseSync(VERITABANI);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 4000;
    CREATE TABLE IF NOT EXISTS kullanici (
      id TEXT PRIMARY KEY, ad TEXT NOT NULL UNIQUE, gorunen TEXT NOT NULL, sifre TEXT NOT NULL,
      totp TEXT, totp_son INTEGER NOT NULL DEFAULT 0, yonetici INTEGER NOT NULL DEFAULT 0,
      olusturma INTEGER NOT NULL, kapali INTEGER NOT NULL DEFAULT 0, oturum_surum INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS oturum (
      ozet TEXT PRIMARY KEY, kullanici TEXT NOT NULL REFERENCES kullanici(id) ON DELETE CASCADE,
      olusturma INTEGER NOT NULL, bitis INTEGER NOT NULL, ajan TEXT NOT NULL DEFAULT '', surum INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS ekip (
      id TEXT PRIMARY KEY, ad TEXT NOT NULL, sahip TEXT NOT NULL REFERENCES kullanici(id),
      olusturma INTEGER NOT NULL, sira INTEGER NOT NULL DEFAULT 0, temiz INTEGER NOT NULL DEFAULT 0,
      boyut INTEGER NOT NULL DEFAULT 0, adet INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS uye (
      ekip TEXT NOT NULL REFERENCES ekip(id) ON DELETE CASCADE, kullanici TEXT NOT NULL REFERENCES kullanici(id) ON DELETE CASCADE,
      rol TEXT NOT NULL, katilma INTEGER NOT NULL, PRIMARY KEY (ekip, kullanici));
    CREATE TABLE IF NOT EXISTS davet (
      ozet TEXT PRIMARY KEY, ekip TEXT NOT NULL REFERENCES ekip(id) ON DELETE CASCADE, rol TEXT NOT NULL,
      olusturan TEXT NOT NULL, bitis INTEGER NOT NULL, kalan INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS kayit (
      ekip TEXT NOT NULL REFERENCES ekip(id) ON DELETE CASCADE, k TEXT NOT NULL, d TEXT, t INTEGER NOT NULL,
      u TEXT NOT NULL, sira INTEGER NOT NULL, b INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (ekip, k));
    CREATE INDEX IF NOT EXISTS kayit_sira ON kayit (ekip, sira);
    CREATE TABLE IF NOT EXISTS gunluk (zaman INTEGER NOT NULL, olay TEXT NOT NULL, kim TEXT, ip TEXT, ayrinti TEXT);
    CREATE TABLE IF NOT EXISTS ayar (k TEXT PRIMARY KEY, v TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS onceki (
      id INTEGER PRIMARY KEY AUTOINCREMENT, ekip TEXT NOT NULL REFERENCES ekip(id) ON DELETE CASCADE,
      k TEXT NOT NULL, d TEXT NOT NULL, t INTEGER NOT NULL, u TEXT NOT NULL, b INTEGER NOT NULL DEFAULT 0);
    CREATE INDEX IF NOT EXISTS onceki_k ON onceki (ekip, k, id);
    CREATE TABLE IF NOT EXISTS olay (
      id INTEGER PRIMARY KEY AUTOINCREMENT, ekip TEXT NOT NULL REFERENCES ekip(id) ON DELETE CASCADE,
      k TEXT NOT NULL, u TEXT NOT NULL, t INTEGER NOT NULL, tur TEXT NOT NULL, baslik TEXT NOT NULL DEFAULT '');
    CREATE INDEX IF NOT EXISTS olay_ekip ON olay (ekip, id);
    CREATE INDEX IF NOT EXISTS olay_k ON olay (ekip, k, id);
  `);
  // eski sürümün veritabanında olmayan sütunlar
  const kolonlar = t => db.prepare('PRAGMA table_info(' + t + ')').all().map(x => x.name);
  const ek = kolonlar('ekip');
  if (!ek.includes('temiz')) db.exec('ALTER TABLE ekip ADD COLUMN temiz INTEGER NOT NULL DEFAULT 0');
  if (!ek.includes('boyut')) db.exec('ALTER TABLE ekip ADD COLUMN boyut INTEGER NOT NULL DEFAULT 0');
  if (!ek.includes('adet')) db.exec('ALTER TABLE ekip ADD COLUMN adet INTEGER NOT NULL DEFAULT 0');
  if (!ek.includes('gboyut')) db.exec('ALTER TABLE ekip ADD COLUMN gboyut INTEGER NOT NULL DEFAULT 0');
  if (!kolonlar('kayit').includes('b')) db.exec('ALTER TABLE kayit ADD COLUMN b INTEGER NOT NULL DEFAULT 0');
}
veritabaniAc();
const Q = sql => db.prepare(sql);
const tx = fn => (...a) => { db.exec('BEGIN IMMEDIATE'); try { const r = fn(...a); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; } };
function gunluk(olay, kim, ip, ayrinti) {
  try { Q('INSERT INTO gunluk VALUES (?, ?, ?, ?, ?)').run(Date.now(), olay, kim || null, ip || null, ayrinti ? String(ayrinti).slice(0, 300) : null); } catch (e) {}
}

/* ---------- şifre, belirteç, TOTP ---------- */
const rastgele = (n = 32) => crypto.randomBytes(n).toString('base64url');
const ozet = s => crypto.createHash('sha256').update(String(s)).digest('base64url');
const yeniId = () => crypto.randomBytes(9).toString('base64url').replace(/[^A-Za-z0-9]/g, 'x');
/* Dönem: veritabanı her geri yüklendiğinde değişir; cihazlar eski sıra numaralarına güvenmeyip baştan alır */
let DONEM = (Q("SELECT v FROM ayar WHERE k = 'donem'").get() || {}).v;
if (!DONEM) { DONEM = rastgele(9); Q("INSERT INTO ayar VALUES ('donem', ?)").run(DONEM); }
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
function sifreOzet(sifre) {
  const tuz = crypto.randomBytes(16);
  const h = crypto.scryptSync(String(sifre).normalize('NFC'), tuz, 64, SCRYPT);
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, tuz.toString('base64'), h.toString('base64')].join('$');
}
/* Şifre özeti iş parçacığında hesaplanır: bu sırada sunucu (canlı bağlantılar, diğer istekler) donmaz.
   Aynı anda en fazla 3 hesaplama (gerisi sırada bekler). Aynı kullanıcı adı için denemeler sırayla işlenir
   ve deneme sayaçlarına hesaplamadan hemen önce yeniden bakılır: aynı anda çok istek atarak sınır aşılamaz. */
function scryptA(sifre, tuz, o) {
  return new Promise((ok, no) => crypto.scrypt(String(sifre).normalize('NFC'), tuz, 64, o, (e, h) => (e ? no(e) : ok(h))));
}
async function sifreOzetA(sifre) {
  const tuz = crypto.randomBytes(16);
  const h = await scryptA(sifre, tuz, SCRYPT);
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, tuz.toString('base64'), h.toString('base64')].join('$');
}
async function sifreDogruA(sifre, kayitli) {
  const p = String(kayitli || '').split('$');
  if (p.length !== 6 || p[0] !== 'scrypt') return false;
  const h = await scryptA(sifre, Buffer.from(p[4], 'base64'), { N: +p[1], r: +p[2], p: +p[3], maxmem: 128 * 1024 * 1024 });
  const k = Buffer.from(p[5], 'base64');
  return k.length === h.length && crypto.timingSafeEqual(k, h);
}
const YOGUN = () => Object.assign(new Error('yoğun'), { yogun: true });
let hesapta = 0;
const hesapSirasi = [];
async function hesapla(is) {
  if (hesapta < 3) hesapta++;
  else { if (hesapSirasi.length >= 100) throw YOGUN(); await new Promise(r => hesapSirasi.push(r)); }
  try { return await is(); }
  finally { const n = hesapSirasi.shift(); if (n) n(); else hesapta--; }   // sıradakine yer devredilir
}
const siradaki = new Map();   // anahtar -> { son: son işin sözü, n: bekleyen + çalışan }
async function sirayla(anahtar, is) {
  let x = siradaki.get(anahtar);
  if (!x) { x = { son: null, n: 0 }; siradaki.set(anahtar, x); }
  if (x.n >= 10) throw YOGUN();
  const once = x.son;
  let bitir;
  const bu = new Promise(r => { bitir = r; });
  x.son = bu; x.n++;
  try { if (once) await once; return await hesapla(is); }
  finally { bitir(); if (--x.n === 0 && siradaki.get(anahtar) === x) siradaki.delete(anahtar); }
}
async function sifreIsi(res, anahtar, is) {   // yoğunsa cevabı verip null döner
  try { return await sirayla(anahtar, is); }
  catch (e) { if (e && e.yogun) { hata(res, 429, 'Sunucu şu an çok yoğun; biraz sonra yeniden dene.'); return null; } throw e; }
}
const SAHTE_OZET = sifreOzet(rastgele());   // olmayan kullanıcıda da aynı sürede cevap verilsin
function sifreUygun(s) {
  s = String(s || '');
  if (s.length < 10) return 'Şifre en az 10 karakter olmalı.';
  if (s.length > 200) return 'Şifre çok uzun.';
  if (/^(.)\1+$/.test(s) || /^(?:0123456789|1234567890|password|sifre12345)/i.test(s)) return 'Bu şifre çok kolay tahmin edilir.';
  return '';
}
/* Görünen ad / ekip adı: kontrol ve yön değiştirme karakterleri (adı başka biri gibi göstermeye yarar) atılır */
const metin = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
/* Etkinlik geçmişinde görünen ad: kartın başlığı, projenin / tablonun / şemanın adı, şeklin ya da yorumun metni */
function kayitBasligi(o) {
  if (!o || typeof o !== 'object') return '';
  for (const a of ['title', 'name', 'text', 'label']) if (typeof o[a] === 'string' && o[a].trim()) return metin(o[a], 80);
  return '';
}
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function b32(buf) { let bits = '', out = ''; for (const b of buf) bits += b.toString(2).padStart(8, '0'); for (let i = 0; i + 5 <= bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)]; return out; }
function b32coz(s) { let bits = ''; for (const c of String(s).replace(/=+$/, '').toUpperCase()) { const v = B32.indexOf(c); if (v < 0) throw new Error('b32'); bits += v.toString(2).padStart(5, '0'); } const out = []; for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2)); return Buffer.from(out); }
function totpKod(gizli, adim) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(adim));
  const h = crypto.createHmac('sha1', b32coz(gizli)).update(msg).digest();
  const o = h[h.length - 1] & 15;
  return String(((h.readUInt32BE(o) & 0x7fffffff) % 1000000)).padStart(6, '0');
}
/* Kodu doğrular; aynı kod ikinci kez kullanılamaz. Doğruysa kullanılan adımı döndürür. */
function totpDogrula(gizli, kod, son) {
  kod = String(kod || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(kod)) return 0;
  const simdi = Math.floor(Date.now() / 30000);
  for (const a of [simdi, simdi - 1, simdi + 1]) {
    if (a <= son) continue;
    const k = totpKod(gizli, a);
    if (crypto.timingSafeEqual(Buffer.from(k), Buffer.from(kod))) return a;
  }
  return 0;
}

/* ---------- deneme sınırı (bellekte) ---------- */
const deneme = new Map();   // anahtar -> { n, ilk, kilit }
function sinirli(anahtar, max, pencere) {
  const s = Date.now(), x = deneme.get(anahtar);
  if (x && x.kilit > s) return Math.ceil((x.kilit - s) / 60000);
  if (x && s - x.ilk > pencere) deneme.delete(anahtar);
  return 0;
}
function basarisiz(anahtar, max, pencere) {
  const s = Date.now();
  let x = deneme.get(anahtar);
  if (!x || s - x.ilk > pencere) { x = { n: 0, ilk: s, kilit: 0 }; deneme.set(anahtar, x); }
  x.n++;
  if (x.n >= max) x.kilit = s + pencere;
}
setInterval(() => { const s = Date.now(); for (const [k, x] of deneme) if (s - x.ilk > 3600000 && x.kilit < s) deneme.delete(k); }, 600000).unref();
const DK15 = 15 * 60000, SAAT = 60 * 60000;

/* ---------- HTTP yardımcıları ---------- */
function ipOf(req) {
  if (AYAR.vekil === 'cloudflare' && /^(127\.0\.0\.1|::1|::ffff:127\.0\.0\.1)$/.test(req.socket.remoteAddress || '')) {
    const h = String(req.headers['cf-connecting-ip'] || '').trim();
    if (/^[0-9a-fA-F:.]{3,45}$/.test(h)) return h;
  }
  return req.socket.remoteAddress || '';
}
function guvenlikBasliklari(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), payment=(), usb=(), microphone=(self)');
  if (AYAR.adres.startsWith('https://')) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}
function json(res, kod, veri, ek) {
  const b = Buffer.from(JSON.stringify(veri));
  guvenlikBasliklari(res);
  res.writeHead(kod, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': b.length, 'Cache-Control': 'no-store' }, ek || {}));
  res.end(b);
}
const hata = (res, kod, mesaj) => json(res, kod, { hata: mesaj });
function govde(req) {   // sınırı aşan gövde okunup atılır (bağlantı kopmadan 413 dönülsün), çok büyükse bağlantı kesilir
  return new Promise((ok, red) => {
    let n = 0, buyuk = false;
    const parcalar = [];
    req.on('data', c => {
      n += c.length;
      if (n > ISTEK_MAX) { buyuk = true; parcalar.length = 0; if (n > 8 * ISTEK_MAX) req.destroy(); return; }
      parcalar.push(c);
    });
    req.on('end', () => {
      if (buyuk) return red(Object.assign(new Error('büyük'), { kod: 413 }));
      try { ok(n ? JSON.parse(Buffer.concat(parcalar).toString('utf8')) : {}); } catch (e) { red(Object.assign(new Error('json'), { kod: 400 })); }
    });
    req.on('error', red);
  });
}
function cerezler(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim(); });
  return out;
}
const CEREZ = 'wn_oturum';
function cerezYaz(res, deger, sure) {
  const guvenli = AYAR.adres.startsWith('https://') ? '; Secure' : '';
  res.setHeader('Set-Cookie', CEREZ + '=' + deger + '; Path=/; HttpOnly; SameSite=Strict' + guvenli + '; Max-Age=' + Math.floor(sure / 1000));
}
/* Değiştiren isteklerde: aynı siteden gelmeli (Origin) ve uygulamanın özel başlığı olmalı (CSRF) */
function ayniSite(req) {
  if (req.headers['x-wn'] !== '1') return false;
  const o = req.headers.origin;
  if (!o) return true;   // aynı kökenli fetch'lerde bazı tarayıcılar Origin göndermeyebilir; özel başlık yine şart
  if (AYAR.adres) return o === AYAR.adres;
  return o === 'http://' + req.headers.host || o === 'https://' + req.headers.host;
}

/* ---------- oturum ---------- */
function oturumAc(res, k, ajan) {
  const b = rastgele(32), s = Date.now();
  Q('INSERT INTO oturum (ozet, kullanici, olusturma, bitis, ajan, surum) VALUES (?, ?, ?, ?, ?, ?)').run(ozet(b), k.id, s, s + OTURUM_SURE, String(ajan || '').slice(0, 160), k.oturum_surum);
  cerezYaz(res, b, OTURUM_SURE);
}
function kimdir(req) {
  const b = cerezler(req)[CEREZ];
  if (!b || !/^[A-Za-z0-9_-]{30,60}$/.test(b)) return null;
  const o = Q('SELECT o.ozet, o.bitis, o.surum, k.* FROM oturum o JOIN kullanici k ON k.id = o.kullanici WHERE o.ozet = ?').get(ozet(b));
  if (!o || o.bitis < Date.now() || o.kapali || o.surum !== o.oturum_surum) return null;
  if (o.bitis - Date.now() < OTURUM_SURE - GUN) Q('UPDATE oturum SET bitis = ? WHERE ozet = ?').run(Date.now() + OTURUM_SURE, o.ozet);   // kullanıldıkça uzar
  return o;
}
function oturumGecerli(oz) {
  const o = Q('SELECT o.bitis, o.surum, k.oturum_surum, k.kapali FROM oturum o JOIN kullanici k ON k.id = o.kullanici WHERE o.ozet = ?').get(oz);
  return !!o && o.bitis > Date.now() && !o.kapali && o.surum === o.oturum_surum;
}
const rolOf = (ekip, kid) => { const r = Q('SELECT rol FROM uye WHERE ekip = ? AND kullanici = ?').get(ekip, kid); return r ? r.rol : null; };
const yazabilir = rol => rol === 'sahip' || rol === 'yonetici' || rol === 'uye';
const yonetebilir = rol => rol === 'sahip' || rol === 'yonetici';
const kullaniciDisa = k => ({ id: k.id, ad: k.ad, gorunen: k.gorunen, yonetici: !!k.yonetici, totp: !!k.totp });
function davetBul(kod) {
  kod = String(kod || '');
  if (!DAVET_RE.test(kod)) return null;
  const dv = Q('SELECT * FROM davet WHERE ozet = ?').get(ozet(kod));
  return dv && dv.bitis > Date.now() && dv.kalan > 0 ? dv : null;
}

/* ---------- canlı yayın (Server-Sent Events) ---------- */
const dinleyiciler = new Map();   // ekip -> Set<{ res, kid, oz }>
const kimler = new Map();         // ekip -> Map<kid, { at, pid, view, away, gorunen }>
function yayinla(ekip, olay, veri) {
  const set = dinleyiciler.get(ekip);
  if (!set) return;
  const s = 'event: ' + olay + '\ndata: ' + JSON.stringify(veri) + '\n\n';
  for (const d of set) { try { d.res.write(s); } catch (e) {} }
}
function kimlerPaket(ekip) {
  const m = kimler.get(ekip) || new Map(), s = Date.now(), out = {};
  for (const [kid, x] of m) { if (s - x.at < 120000) out[kid] = x; else m.delete(kid); }
  return { simdi: s, kimler: out };
}
/* Koşula uyan canlı bağlantıları kapatır (çıkış, şifre değişimi, ekipten çıkarılma). Tarayıcı yeniden
   bağlanmayı dener; oturumu ya da üyeliği yoksa reddedilir ve uygulama durumu öğrenir. */
function akisKapat(kosul) {
  for (const [e, set] of dinleyiciler) for (const d of [...set]) {
    if (!kosul(d, e)) continue;
    set.delete(d);
    try { d.res.end(); } catch (x) {}
    kimDusur(e, d.kid);
  }
}
function kimDusur(ekip, kid) {   // kişinin o ekipte açık sekmesi kalmadıysa çevrimiçi listesinden çıkar
  const set = dinleyiciler.get(ekip);
  if (set && [...set].some(x => x.kid === kid)) return;
  const m = kimler.get(ekip);
  if (m && m.delete(kid)) yayinla(ekip, 'kimler', kimlerPaket(ekip));
}
/* Her 25 sn: bağlantı canlı kalsın diye nabız; oturumu kapanan / ekipten çıkarılan kişinin bağlantısı kesilir */
setInterval(() => {
  for (const [e, set] of dinleyiciler) {
    for (const d of [...set]) {
      let gecerli = true;
      try { gecerli = oturumGecerli(d.oz) && !!rolOf(e, d.kid); } catch (x) {}
      if (!gecerli) { set.delete(d); try { d.res.end(); } catch (x) {} kimDusur(e, d.kid); continue; }
      try { d.res.write('event: nabiz\ndata: 1\n\n'); } catch (x) {}   // istemci bunu görür: uzun süre gelmezse yeniden bağlanır
    }
    if (!set.size) dinleyiciler.delete(e);
  }
}, 25000).unref();

/* ---------- API ---------- */
const API = [];
const yol = (yontem, desen, fn, opt) => API.push({ yontem, desen, fn, opt: opt || {} });

yol('GET', /^\/api\/durum$/, (req, res) => json(res, 200, { whitenote: true, surum: SURUM }), { acik: true });

yol('POST', /^\/api\/giris$/, async (req, res, p, b) => {
  const ip = ipOf(req), ad = String(b.ad || '').trim().toLowerCase(), sifre = String(b.sifre || '');
  const kilit = () => sinirli('ip:' + ip, 20, DK15) || sinirli('ad:' + ad, 10, DK15);
  const dk = kilit();
  if (dk) return hata(res, 429, 'Çok fazla deneme. ' + dk + ' dakika sonra yeniden dene.');
  const r = await sifreIsi(res, 'ad:' + ad, async () => {
    const dk2 = kilit();
    if (dk2) return { kod: 429, msg: 'Çok fazla deneme. ' + dk2 + ' dakika sonra yeniden dene.' };
    const k0 = AD_RE.test(ad) ? Q('SELECT * FROM kullanici WHERE ad = ?').get(ad) : null;
    const dogru = (await sifreDogruA(sifre, k0 ? k0.sifre : SAHTE_OZET)) && !!k0;
    const k = dogru ? Q('SELECT * FROM kullanici WHERE id = ?').get(k0.id) : null;   // beklerken değişmiş olabilir
    if (!k || k.kapali || k.sifre !== k0.sifre) {
      basarisiz('ip:' + ip, 20, DK15); basarisiz('ad:' + ad, 10, DK15);
      gunluk('giris-hatali', ad, ip);
      return { kod: 401, msg: 'Kullanıcı adı ya da şifre yanlış.' };
    }
    if (k.totp) {
      if (!b.kod) return { totp: true };
      const a = totpDogrula(k.totp, b.kod, k.totp_son);
      if (!a) { basarisiz('ad:' + ad, 10, DK15); gunluk('totp-hatali', ad, ip); return { kod: 401, msg: 'Doğrulama kodu yanlış.' }; }
      Q('UPDATE kullanici SET totp_son = ? WHERE id = ?').run(a, k.id);
    }
    deneme.delete('ad:' + ad);
    oturumAc(res, k, req.headers['user-agent']);
    gunluk('giris', k.id, ip);
    return { k };
  });
  if (!r) return;
  if (r.kod) return hata(res, r.kod, r.msg);
  if (r.totp) return json(res, 200, { totpGerekli: true });
  json(res, 200, { kullanici: kullaniciDisa(r.k) });
}, { acik: true });

yol('POST', /^\/api\/cikis$/, (req, res) => {
  const c = cerezler(req)[CEREZ];
  if (c) { const oz = ozet(c); Q('DELETE FROM oturum WHERE ozet = ?').run(oz); akisKapat(d => d.oz === oz); }
  cerezYaz(res, '', 0);
  json(res, 200, { tamam: true });
}, { acik: true });

yol('GET', /^\/api\/ben$/, (req, res, p, b, k) => {
  const ekipler = Q('SELECT e.id, e.ad, u.rol FROM uye u JOIN ekip e ON e.id = u.ekip WHERE u.kullanici = ? ORDER BY e.ad').all(k.id);
  json(res, 200, { kullanici: kullaniciDisa(k), ekipler: ekipler.map(x => ({ id: x.id, ad: x.ad, rol: x.rol })), surum: SURUM });
});

yol('POST', /^\/api\/ad$/, (req, res, p, b, k) => {
  const g = metin(b.gorunen, 60);
  if (!g) return hata(res, 400, 'Görünen ad boş olamaz.');
  Q('UPDATE kullanici SET gorunen = ? WHERE id = ?').run(g, k.id);
  for (const x of Q('SELECT ekip FROM uye WHERE kullanici = ?').all(k.id)) yayinla(x.ekip, 'uyeler', {});
  json(res, 200, { tamam: true });
});

yol('POST', /^\/api\/sifre$/, async (req, res, p, b, k) => {
  const dk = sinirli('ad:' + k.ad, 10, DK15);
  if (dk) return hata(res, 429, 'Çok fazla deneme. ' + dk + ' dakika sonra yeniden dene.');
  const r = await sifreIsi(res, 'ad:' + k.ad, async () => {
    const k2 = kimdir(req);   // beklerken oturum kapanmış ya da şifre değişmiş olabilir
    if (!k2 || k2.id !== k.id) return { kod: 401, msg: 'Oturum kapalı; yeniden giriş yap.' };
    const dk2 = sinirli('ad:' + k2.ad, 10, DK15);
    if (dk2) return { kod: 429, msg: 'Çok fazla deneme. ' + dk2 + ' dakika sonra yeniden dene.' };
    if (!(await sifreDogruA(String(b.eski || ''), k2.sifre))) { basarisiz('ad:' + k2.ad, 10, DK15); return { kod: 401, msg: 'Şu anki şifre yanlış.' }; }
    const u = sifreUygun(b.yeni);
    if (u) return { kod: 400, msg: u };
    const yeni = await sifreOzetA(b.yeni);
    const k3 = kimdir(req);
    if (!k3 || k3.id !== k.id || k3.sifre !== k2.sifre) return { kod: 409, msg: 'Şifre bu arada başka bir yerde değişti; sayfayı yenileyip yeniden dene.' };
    Q('UPDATE kullanici SET sifre = ?, oturum_surum = oturum_surum + 1 WHERE id = ?').run(yeni, k.id);
    Q('DELETE FROM oturum WHERE kullanici = ?').run(k.id);
    oturumAc(res, Q('SELECT * FROM kullanici WHERE id = ?').get(k.id), req.headers['user-agent']);   // diğer cihazlardaki oturumlar kapanır, bu açık kalır
    akisKapat(d => d.kid === k.id);                  // bu cihazın canlı bağlantısı da yeni çerezle yeniden bağlanır
    gunluk('sifre-degisti', k.id, ipOf(req));
    return {};
  });
  if (!r) return;
  if (r.kod) return hata(res, r.kod, r.msg);
  json(res, 200, { tamam: true });
});

/* İki adımlı doğrulama: önce gizli anahtar gösterilir (uygulamaya eklenir), ilk kodla açılır */
const bekleyenTotp = new Map();   // kullanıcı -> { gizli, bitis }
yol('POST', /^\/api\/totp\/baslat$/, (req, res, p, b, k) => {
  if (k.totp) return hata(res, 400, 'İki adımlı doğrulama zaten açık.');
  const gizli = b32(crypto.randomBytes(20));
  bekleyenTotp.set(k.id, { gizli, bitis: Date.now() + 10 * 60000 });
  json(res, 200, { gizli, uri: 'otpauth://totp/White%20Note:' + encodeURIComponent(k.ad) + '?secret=' + gizli + '&issuer=White%20Note' });
});
yol('POST', /^\/api\/totp\/ac$/, (req, res, p, b, k) => {
  const x = bekleyenTotp.get(k.id);
  if (!x || x.bitis < Date.now()) return hata(res, 400, 'Süre doldu; baştan başla.');
  const a = totpDogrula(x.gizli, b.kod, 0);
  if (!a) return hata(res, 400, 'Kod yanlış; telefondaki uygulamanın saatini kontrol et.');
  Q('UPDATE kullanici SET totp = ?, totp_son = ? WHERE id = ?').run(x.gizli, a, k.id);
  bekleyenTotp.delete(k.id);
  gunluk('totp-acildi', k.id, ipOf(req));
  json(res, 200, { tamam: true });
});
yol('POST', /^\/api\/totp\/kapat$/, async (req, res, p, b, k) => {
  if (!k.totp) return json(res, 200, { tamam: true });
  const dk = sinirli('ad:' + k.ad, 10, DK15);
  if (dk) return hata(res, 429, 'Çok fazla deneme. ' + dk + ' dakika sonra yeniden dene.');
  const r = await sifreIsi(res, 'ad:' + k.ad, async () => {
    const k2 = kimdir(req);
    if (!k2 || k2.id !== k.id) return { kod: 401, msg: 'Oturum kapalı; yeniden giriş yap.' };
    if (!k2.totp) return {};
    const dk2 = sinirli('ad:' + k2.ad, 10, DK15);
    if (dk2) return { kod: 429, msg: 'Çok fazla deneme. ' + dk2 + ' dakika sonra yeniden dene.' };
    const dogru = await sifreDogruA(String(b.sifre || ''), k2.sifre);
    const k3 = kimdir(req);
    if (!k3 || k3.id !== k.id) return { kod: 401, msg: 'Oturum kapalı; yeniden giriş yap.' };
    if (!k3.totp) return {};
    const a = dogru && k3.sifre === k2.sifre ? totpDogrula(k3.totp, b.kod, k3.totp_son) : 0;
    if (!a) { basarisiz('ad:' + k3.ad, 10, DK15); return { kod: 401, msg: 'Şifre ya da kod yanlış.' }; }
    Q('UPDATE kullanici SET totp = NULL, totp_son = 0 WHERE id = ?').run(k.id);
    gunluk('totp-kapandi', k.id, ipOf(req));
    return {};
  });
  if (!r) return;
  if (r.kod) return hata(res, r.kod, r.msg);
  json(res, 200, { tamam: true });
});

/* Davet koduna bakış: "X ekibine davet edildin" yazabilmek için (kod geçerliyse ekibin adı ve rol) */
yol('POST', /^\/api\/davet-bak$/, (req, res, p, b) => {
  const ip = ipOf(req);
  const dk = sinirli('kayit:' + ip, 10, SAAT);
  if (dk) return hata(res, 429, 'Çok fazla deneme. ' + dk + ' dakika sonra yeniden dene.');
  const dv = davetBul(b.davet);
  if (!dv) { basarisiz('kayit:' + ip, 10, SAAT); return hata(res, 400, 'Davet kodu geçersiz ya da süresi dolmuş.'); }
  const e = Q('SELECT ad FROM ekip WHERE id = ?').get(dv.ekip);
  json(res, 200, { ekip: { ad: e ? e.ad : 'Ekip' }, rol: dv.rol === 'sahip' ? 'uye' : dv.rol, bitis: dv.bitis });
}, { acik: true });

/* Davetle kayıt: açık kayıt yok; ekip sahibinin / yöneticisinin verdiği kodla */
yol('POST', /^\/api\/kayit$/, async (req, res, p, b) => {
  const ip = ipOf(req);
  const dk = sinirli('kayit:' + ip, 10, SAAT);
  if (dk) return hata(res, 429, 'Çok fazla deneme. ' + dk + ' dakika sonra yeniden dene.');
  const dv = davetBul(b.davet);
  if (!dv) { basarisiz('kayit:' + ip, 10, SAAT); return hata(res, 400, 'Davet kodu geçersiz ya da süresi dolmuş.'); }
  const ad = String(b.ad || '').trim().toLowerCase(), gorunen = metin(b.gorunen, 60) || ad;
  if (!AD_RE.test(ad)) return hata(res, 400, 'Kullanıcı adı 3–32 karakter olmalı: küçük harf, rakam, nokta, alt çizgi, tire.');
  const u = sifreUygun(b.sifre);
  if (u) return hata(res, 400, u);
  if (Q('SELECT 1 FROM kullanici WHERE ad = ?').get(ad)) return hata(res, 409, 'Bu kullanıcı adı alınmış.');
  const ozetli = await sifreIsi(res, 'kayit-ad:' + ad, () => sifreOzetA(b.sifre));
  if (!ozetli) return;
  // Beklerken davet kullanılmış ya da ad alınmış olabilir: tek işlemde yeniden bakılır
  const id = yeniId(), s = Date.now();
  const sonuc = tx(() => {
    const dv2 = davetBul(b.davet);
    if (!dv2) return 'davet';
    if (Q('SELECT 1 FROM kullanici WHERE ad = ?').get(ad)) return 'ad';
    Q('INSERT INTO kullanici (id, ad, gorunen, sifre, olusturma) VALUES (?, ?, ?, ?, ?)').run(id, ad, gorunen, ozetli, s);
    Q('INSERT INTO uye VALUES (?, ?, ?, ?)').run(dv2.ekip, id, dv2.rol === 'sahip' ? 'uye' : dv2.rol, s);
    Q('UPDATE davet SET kalan = kalan - 1 WHERE ozet = ?').run(dv2.ozet);
    return dv2;
  })();
  if (sonuc === 'davet') return hata(res, 400, 'Davet kodu geçersiz ya da süresi dolmuş.');
  if (sonuc === 'ad') return hata(res, 409, 'Bu kullanıcı adı alınmış.');
  const k = Q('SELECT * FROM kullanici WHERE id = ?').get(id);
  oturumAc(res, k, req.headers['user-agent']);
  gunluk('kayit', id, ip, sonuc.ekip);
  yayinla(sonuc.ekip, 'uyeler', {});
  json(res, 200, { kullanici: kullaniciDisa(k), ekip: sonuc.ekip });
}, { acik: true });

/* Var olan kullanıcı davet koduyla ekibe katılır */
yol('POST', /^\/api\/katil$/, (req, res, p, b, k) => {
  const ip = ipOf(req);
  const dk = sinirli('kayit:' + ip, 10, SAAT);
  if (dk) return hata(res, 429, 'Çok fazla deneme. ' + dk + ' dakika sonra yeniden dene.');
  const dv = davetBul(b.davet);
  if (!dv) { basarisiz('kayit:' + ip, 10, SAAT); return hata(res, 400, 'Davet kodu geçersiz ya da süresi dolmuş.'); }
  if (!rolOf(dv.ekip, k.id)) tx(() => {
    Q('INSERT INTO uye VALUES (?, ?, ?, ?)').run(dv.ekip, k.id, dv.rol === 'sahip' ? 'uye' : dv.rol, Date.now());
    Q('UPDATE davet SET kalan = kalan - 1 WHERE ozet = ?').run(dv.ozet);
  })();
  gunluk('katildi', k.id, ip, dv.ekip);
  yayinla(dv.ekip, 'uyeler', {});
  json(res, 200, { ekip: dv.ekip });
});

yol('POST', /^\/api\/ekip$/, (req, res, p, b, k) => {
  const ad = metin(b.ad, 60);
  if (!ad) return hata(res, 400, 'Ekibin adı boş olamaz.');
  if (Q('SELECT COUNT(*) n FROM ekip WHERE sahip = ?').get(k.id).n >= 20) return hata(res, 400, 'En fazla 20 ekip kurulabilir.');
  const id = yeniId(), s = Date.now();
  tx(() => {
    Q('INSERT INTO ekip (id, ad, sahip, olusturma) VALUES (?, ?, ?, ?)').run(id, ad, k.id, s);
    Q('INSERT INTO uye VALUES (?, ?, ?, ?)').run(id, k.id, 'sahip', s);
  })();
  gunluk('ekip-kuruldu', k.id, ipOf(req), id);
  json(res, 200, { ekip: { id, ad, rol: 'sahip' } });
});

const EKIP = '([A-Za-z0-9]{6,20})';
yol('POST', new RegExp('^/api/ekip/' + EKIP + '/ad$'), (req, res, p, b, k, rol) => {
  if (rol !== 'sahip') return hata(res, 403, 'Ekibin adını yalnız sahibi değiştirir.');
  const ad = metin(b.ad, 60);
  if (!ad) return hata(res, 400, 'Ekibin adı boş olamaz.');
  Q('UPDATE ekip SET ad = ? WHERE id = ?').run(ad, p[1]);
  yayinla(p[1], 'ekip', { ad });
  json(res, 200, { tamam: true });
}, { ekip: true });

yol('GET', new RegExp('^/api/ekip/' + EKIP + '/uyeler$'), (req, res, p, b, k, rol) => {
  const L = Q('SELECT k.id, k.ad, k.gorunen, u.rol, u.katilma FROM uye u JOIN kullanici k ON k.id = u.kullanici WHERE u.ekip = ? ORDER BY u.katilma').all(p[1]);
  const e = Q('SELECT id, ad FROM ekip WHERE id = ?').get(p[1]);
  json(res, 200, { ekip: { id: e.id, ad: e.ad }, rol, uyeler: L.map(x => ({ id: x.id, ad: x.ad, gorunen: x.gorunen, rol: x.rol, katilma: x.katilma })) });
}, { ekip: true });

yol('POST', new RegExp('^/api/ekip/' + EKIP + '/davet$'), (req, res, p, b, k, rol) => {
  if (!yonetebilir(rol)) return hata(res, 403, 'Davet kodunu ekibin sahibi ya da yöneticisi oluşturur.');
  const r = ['yonetici', 'uye', 'okur'].includes(b.rol) ? b.rol : 'uye';
  if (r === 'yonetici' && rol !== 'sahip') return hata(res, 403, 'Yönetici davetini yalnız sahip oluşturur.');
  const gun = Math.min(30, Math.max(1, Math.floor(+b.gun) || 7)), kac = Math.min(50, Math.max(1, Math.floor(+b.kac) || 1));
  if (Q('SELECT COUNT(*) n FROM davet WHERE ekip = ? AND bitis > ? AND kalan > 0').get(p[1], Date.now()).n >= 50) return hata(res, 400, 'Çok fazla açık davet var; eskilerden bazılarını iptal et.');
  const kod = rastgele(18), bitis = Date.now() + gun * GUN;
  Q('INSERT INTO davet VALUES (?, ?, ?, ?, ?, ?)').run(ozet(kod), p[1], r, k.id, bitis, kac);
  gunluk('davet', k.id, ipOf(req), p[1] + ' ' + r);
  json(res, 200, { kod, rol: r, bitis, kac });
}, { ekip: true });

/* Açık davetler (kodun kendisi saklanmaz, yalnız özeti; iptal etmek için kimlik olarak o kullanılır) */
yol('GET', new RegExp('^/api/ekip/' + EKIP + '/davetler$'), (req, res, p, b, k, rol) => {
  if (!yonetebilir(rol)) return hata(res, 403, 'Davetleri ekibin sahibi ya da yöneticisi görür.');
  const L = Q('SELECT d.ozet, d.rol, d.bitis, d.kalan, k.gorunen FROM davet d LEFT JOIN kullanici k ON k.id = d.olusturan WHERE d.ekip = ? AND d.bitis > ? AND d.kalan > 0 ORDER BY d.bitis').all(p[1], Date.now());
  json(res, 200, { davetler: L.map(x => ({ id: x.ozet, rol: x.rol, bitis: x.bitis, kalan: x.kalan, olusturan: x.gorunen || '' })) });
}, { ekip: true });
yol('POST', new RegExp('^/api/ekip/' + EKIP + '/davet-iptal$'), (req, res, p, b, k, rol) => {
  if (!yonetebilir(rol)) return hata(res, 403, 'Davetleri ekibin sahibi ya da yöneticisi iptal eder.');
  const id = String(b.id || '');
  if (!/^[A-Za-z0-9_-]{43}$/.test(id)) return hata(res, 400, 'Geçersiz istek.');
  const dv = Q('SELECT rol FROM davet WHERE ozet = ? AND ekip = ?').get(id, p[1]);
  if (dv && dv.rol === 'yonetici' && rol !== 'sahip') return hata(res, 403, 'Yönetici davetini yalnız sahip iptal eder.');
  Q('DELETE FROM davet WHERE ozet = ? AND ekip = ?').run(id, p[1]);
  gunluk('davet-iptal', k.id, ipOf(req), p[1]);
  json(res, 200, { tamam: true });
}, { ekip: true });

yol('POST', new RegExp('^/api/ekip/' + EKIP + '/uye/([A-Za-z0-9]{6,20})$'), (req, res, p, b, k, rol) => {
  const hedef = p[2], hr = rolOf(p[1], hedef);
  if (!hr) return hata(res, 404, 'Üye bulunamadı.');
  if (b.cikar) {
    if (hedef !== k.id && !(yonetebilir(rol) && hr !== 'sahip' && (rol === 'sahip' || hr !== 'yonetici'))) return hata(res, 403, 'Bu üyeyi çıkarma yetkin yok.');
    if (hr === 'sahip') return hata(res, 400, 'Ekibin sahibi ekipten çıkamaz.');
    Q('DELETE FROM uye WHERE ekip = ? AND kullanici = ?').run(p[1], hedef);
    akisKapat((d, e) => e === p[1] && d.kid === hedef);   // çıkarılan kişi ekibin yayınını artık almaz
  } else {
    const yeni = String(b.rol || '');
    if (rol !== 'sahip' || !['yonetici', 'uye', 'okur'].includes(yeni) || hr === 'sahip') return hata(res, 403, 'Rolleri yalnız sahip değiştirir.');
    Q('UPDATE uye SET rol = ? WHERE ekip = ? AND kullanici = ?').run(yeni, p[1], hedef);
  }
  gunluk('uye-degisti', k.id, ipOf(req), p[1] + ' ' + hedef + ' ' + (b.cikar ? 'çıkarıldı' : b.rol));
  yayinla(p[1], 'uyeler', {});
  json(res, 200, { tamam: true });
}, { ekip: true });

/* Kayıtlar: ?sonra=N&donem=D verilirse yalnız N'den sonra değişenler (silinenler d: null).
   Dönem farklıysa (veritabanı geri yüklendi), N sunucudakinden büyükse ya da o aralığın silme izleri
   temizlendiyse bütün liste gönderilir (tam: true): cihaz kendi kopyasını buna göre düzeltir. */
yol('GET', new RegExp('^/api/ekip/' + EKIP + '/kayitlar$'), (req, res, p, b, k, rol, url) => {
  let sonra = Math.max(0, parseInt(url.searchParams.get('sonra') || '0', 10) || 0);
  const e = Q('SELECT sira, temiz FROM ekip WHERE id = ?').get(p[1]);
  if (sonra && (url.searchParams.get('donem') !== DONEM || sonra > e.sira || sonra < e.temiz)) sonra = 0;
  const L = sonra ? Q('SELECT k, d, t, u, sira FROM kayit WHERE ekip = ? AND sira > ? ORDER BY sira').all(p[1], sonra)
                  : Q('SELECT k, d, t, u, sira FROM kayit WHERE ekip = ? AND d IS NOT NULL ORDER BY sira').all(p[1]);
  json(res, 200, { sira: e.sira, donem: DONEM, tam: !sonra, kayitlar: L });
}, { ekip: true });

yol('POST', new RegExp('^/api/ekip/' + EKIP + '/yaz$'), (req, res, p, b, k, rol) => {
  if (!yazabilir(rol)) return hata(res, 403, 'Bu ekipte yalnız okuma iznin var.');
  const L = Array.isArray(b.islemler) ? b.islemler : null;
  if (!L || !L.length || L.length > 2000) return hata(res, 400, 'Geçersiz istek.');
  const gorulen = new Set();
  for (const x of L) {
    if (!x || typeof x.k !== 'string' || !ANAHTAR.test(x.k) || gorulen.has(x.k)) return hata(res, 400, 'Geçersiz kayıt anahtarı.');
    gorulen.add(x.k);
    if (x.d !== null && (typeof x.d !== 'string' || x.d.length > KAYIT_MAX)) return hata(res, 400, 'Kayıt çok büyük ya da bozuk.');
    if (x.d !== null) { try { const o = JSON.parse(x.d); if (!o || typeof o !== 'object' || Array.isArray(o)) throw 0; x.o = o; } catch (e) { return hata(res, 400, 'Kayıt bozuk (JSON nesnesi değil).'); } }
  }
  const s = Date.now();
  let sonuc;
  try {
    sonuc = tx(() => {
      const e = Q('SELECT sira, boyut, adet, gboyut FROM ekip WHERE id = ?').get(p[1]);
      let n = e.sira, boyut = e.boyut, adet = e.adet, gboyut = e.gboyut;
      const eski = Q('SELECT b, d, t, u FROM kayit WHERE ekip = ? AND k = ?');
      const ekle = Q('INSERT INTO kayit (ekip, k, d, t, u, sira, b) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (ekip, k) DO UPDATE SET d = excluded.d, t = excluded.t, u = excluded.u, sira = excluded.sira, b = excluded.b');
      const surumEkle = Q('INSERT INTO onceki (ekip, k, d, t, u, b) VALUES (?, ?, ?, ?, ?, ?)');
      const surumFazla = Q('SELECT id, b FROM onceki WHERE ekip = ? AND k = ? ORDER BY id DESC LIMIT -1 OFFSET ' + SURUM_MAX);
      const surumSil = Q('DELETE FROM onceki WHERE id = ?');
      const sonOlay = Q('SELECT id, u, t, tur FROM olay WHERE ekip = ? AND k = ? ORDER BY id DESC LIMIT 1');
      const olayEkle = Q('INSERT INTO olay (ekip, k, u, t, tur, baslik) VALUES (?, ?, ?, ?, ?, ?)');
      const olayTazele = Q('UPDATE olay SET t = ?, baslik = ? WHERE id = ?');
      const ilk = n + 1;
      for (const x of L) {
        const o = eski.get(p[1], x.k), yb = x.d === null ? 0 : Buffer.byteLength(x.d), eskiVar = !!(o && o.d !== null);
        boyut += yb - (o ? o.b : 0);
        adet += (x.d === null ? 0 : 1) - (eskiVar ? 1 : 0);
        // Not geçmişi: önceki hâl saklanır. Aynı kişinin art arda yazmaları (2 dakika içinde) tek sürüm sayılır;
        // silinen kaydın son hâli her zaman saklanır (geri getirilebilsin).
        if (eskiVar && GECMISLI.test(x.k) && o.d !== x.d && (x.d === null || o.u !== k.id || s - o.t > 120000)) {
          surumEkle.run(p[1], x.k, o.d, o.t, o.u, o.b);
          gboyut += o.b;
          for (const f of surumFazla.all(p[1], x.k)) { surumSil.run(f.id); gboyut -= f.b; }
        }
        // Etkinlik geçmişi: aynı kişinin aynı kayıttaki 10 dakika içindeki değişiklikleri tek satır olur
        if (OLAYLI.test(x.k) && (eskiVar || x.d !== null)) {
          const tur = !eskiVar ? 'ekle' : x.d === null ? 'sil' : 'degistir';
          if (tur !== 'degistir' || o.d !== x.d) {
            let baslik = '';
            if (x.d !== null) baslik = kayitBasligi(x.o);
            else { try { baslik = kayitBasligi(JSON.parse(o.d)); } catch (er) {} }
            const son = tur === 'degistir' ? sonOlay.get(p[1], x.k) : null;
            if (son && son.u === k.id && son.tur !== 'sil' && s - son.t < 600000) olayTazele.run(s, baslik, son.id);
            else olayEkle.run(p[1], x.k, k.id, s, tur, baslik);
          }
        }
        ekle.run(p[1], x.k, x.d, s, k.id, ++n, yb);
      }
      const kucultuyor = boyut <= e.boyut && adet <= e.adet;   // silme / küçültme her zaman yapılabilir
      if (!kucultuyor && (boyut > KOTA_BOYUT || adet > KOTA_ADET)) throw Object.assign(new Error('kota'), { kota: true });
      // Eski sürümler de sınırlı: aşılırsa en eskiler silinir
      if (gboyut > GECMIS_BOYUT) {
        const enEski = Q('SELECT id, b FROM onceki WHERE ekip = ? ORDER BY id LIMIT 200');
        while (gboyut > GECMIS_BOYUT * 0.9) {
          const L2 = enEski.all(p[1]);
          if (!L2.length) { gboyut = 0; break; }
          for (const f of L2) { surumSil.run(f.id); gboyut -= f.b; }
        }
      }
      Q('UPDATE ekip SET sira = ?, boyut = ?, adet = ?, gboyut = ? WHERE id = ?').run(n, Math.max(0, boyut), Math.max(0, adet), Math.max(0, gboyut), p[1]);
      return { ilk, sira: n };
    })();
  } catch (e) {
    if (e && e.kota) return hata(res, 413, 'Ekibin depolama sınırı doldu (en fazla ' + Math.round(KOTA_BOYUT / 1048576) + ' MB ya da ' + KOTA_ADET + ' kayıt). Eski projeleri ya da büyük kapak resimlerini silmek yer açar.');
    throw e;
  }
  yayinla(p[1], 'kayit', { sira: sonuc.sira, kim: k.id });
  json(res, 200, sonuc);
}, { ekip: true });

/* Etkinlik geçmişi: kim neyi ne zaman ekledi / değiştirdi / sildi (en yeniden eskiye, 100'er) */
yol('GET', new RegExp('^/api/ekip/' + EKIP + '/etkinlik$'), (req, res, p, b, k, rol, url) => {
  const once = Math.max(0, parseInt(url.searchParams.get('once') || '0', 10) || 0);
  const L = once ? Q('SELECT id, k, u, t, tur, baslik FROM olay WHERE ekip = ? AND id < ? ORDER BY id DESC LIMIT 101').all(p[1], once)
                 : Q('SELECT id, k, u, t, tur, baslik FROM olay WHERE ekip = ? ORDER BY id DESC LIMIT 101').all(p[1]);
  json(res, 200, { olaylar: L.slice(0, 100), dahaVar: L.length > 100 });
}, { ekip: true });

/* Bir kaydın eski sürümleri (en yeniden eskiye) */
yol('GET', new RegExp('^/api/ekip/' + EKIP + '/surumler$'), (req, res, p, b, k, rol, url) => {
  const key = url.searchParams.get('k') || '';
  if (!ANAHTAR.test(key) || !GECMISLI.test(key)) return hata(res, 400, 'Bu kaydın geçmişi tutulmuyor.');
  const L = Q('SELECT id, d, t, u FROM onceki WHERE ekip = ? AND k = ? ORDER BY id DESC LIMIT ' + SURUM_MAX).all(p[1], key);
  json(res, 200, { surumler: L });
}, { ekip: true });

yol('GET', new RegExp('^/api/ekip/' + EKIP + '/akis$'), (req, res, p, b, k) => {
  if (!dinleyiciler.has(p[1])) dinleyiciler.set(p[1], new Set());
  const set = dinleyiciler.get(p[1]);
  if ([...set].filter(x => x.kid === k.id).length >= 8) return hata(res, 429, 'Bu ekipte çok fazla açık sekmen var.');   // bir kişi en fazla 8 sekme
  guvenlikBasliklari(res);
  res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store, no-transform', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.write('retry: 3000\n\n');
  const d = { res, kid: k.id, oz: k.ozet };
  set.add(d);
  const e = Q('SELECT sira FROM ekip WHERE id = ?').get(p[1]);
  res.write('event: merhaba\ndata: ' + JSON.stringify(Object.assign({ sira: e.sira, donem: DONEM }, kimlerPaket(p[1]))) + '\n\n');
  req.on('close', () => { if (set.delete(d)) kimDusur(p[1], k.id); });
}, { ekip: true });

yol('POST', new RegExp('^/api/ekip/' + EKIP + '/kim$'), (req, res, p, b, k) => {
  if (!kimler.has(p[1])) kimler.set(p[1], new Map());
  const x = { at: Date.now(), gorunen: k.gorunen, pid: typeof b.pid === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(b.pid) ? b.pid : '',
              view: ['list', 'board', 'schema', 'flow', 'calendar'].includes(b.view) ? b.view : '', away: !!b.away };
  if (b.ayrildi) kimler.get(p[1]).delete(k.id); else kimler.get(p[1]).set(k.id, x);
  yayinla(p[1], 'kimler', kimlerPaket(p[1]));
  json(res, 200, { tamam: true });
}, { ekip: true });

/* ---------- uygulamanın dosyaları ---------- */
const TURLER = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8' };
/* İçerik güvenlik politikası: index.html'deki satır içi betiklerin özetleri; yalnız bunlar ve
   SQLite motorunun indiği iki adres çalışır. GitHub ile paylaş için api.github.com'a bağlanılabilir. */
function cspHesapla(html) {
  const ozetler = [];
  html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g, (m, at, ic) => {
    if (!/\bsrc=/.test(at || '') && ic.trim()) ozetler.push("'sha256-" + crypto.createHash('sha256').update(ic).digest('base64') + "'");
    return m;
  });
  return ["default-src 'self'",
    "script-src 'self' " + ozetler.join(' ') + " https://cdnjs.cloudflare.com https://cdn.jsdelivr.net 'wasm-unsafe-eval'",
    "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self' data:", "media-src 'self' blob:",
    "connect-src 'self' https://api.github.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
    "worker-src 'self'", "manifest-src 'self'", "frame-src 'none'", "frame-ancestors 'none'", "base-uri 'none'", "form-action 'self'", "object-src 'none'"].join('; ');
}
/* index.html: sunucu işareti eklenir (uygulama ekip alanını bu sunucuda açsın); dosya değişince yenilenir */
let sayfaOnb = { mtime: -1, size: -1 };
function sayfa() {
  const f = path.join(AYAR.uygulama, 'index.html');
  let st;
  try { st = fs.statSync(f); } catch (e) { return null; }
  if (st.mtimeMs === sayfaOnb.mtime && st.size === sayfaOnb.size) return sayfaOnb;
  const html = fs.readFileSync(f, 'utf8').replace('<meta name="wn-sunucu" content="">', '<meta name="wn-sunucu" content="1">');
  const buf = Buffer.from(html);
  sayfaOnb = { mtime: st.mtimeMs, size: st.size, buf, csp: cspHesapla(html),
    etag: '"s' + crypto.createHash('sha256').update(buf).digest('base64url').slice(0, 22) + '"' };
  return sayfaOnb;
}
function dosya(req, res, url) {
  let ad;
  try { ad = decodeURIComponent(url.pathname); } catch (e) { return hata(res, 400, 'Geçersiz adres.'); }
  if (ad === '/' || ad === '') ad = '/index.html';
  if (/[\u0000-\u001f\\]/.test(ad)) return hata(res, 404, 'Bulunamadı.');   // NUL, kontrol karakteri, ters bölü
  const parcalar = ad.split('/').filter(Boolean);
  // gizli dosyalar, sunucu klasörü ve izin verilmeyen türler sunulmaz
  if (parcalar.some(x => x.startsWith('.')) || parcalar[0] === 'sunucu' || !TURLER[path.extname(ad).toLowerCase()]) return hata(res, 404, 'Bulunamadı.');
  const tam = path.resolve(AYAR.uygulama, '.' + path.posix.normalize('/' + parcalar.join('/')));
  if (!tam.startsWith(AYAR.uygulama + path.sep)) return hata(res, 404, 'Bulunamadı.');
  if (tam === path.join(AYAR.uygulama, 'index.html')) {
    const s = sayfa();
    if (!s) return hata(res, 404, 'Bulunamadı.');
    guvenlikBasliklari(res);
    const h = { 'Content-Type': TURLER['.html'], 'ETag': s.etag, 'Cache-Control': 'no-cache', 'Content-Security-Policy': s.csp };
    if (req.headers['if-none-match'] === s.etag) { res.writeHead(304, h); res.end(); return; }
    h['Content-Length'] = s.buf.length;
    res.writeHead(200, h);
    res.end(req.method === 'HEAD' ? undefined : s.buf);
    return;
  }
  fs.stat(tam, (err, st) => {
    if (err || !st.isFile()) return hata(res, 404, 'Bulunamadı.');
    const tur = TURLER[path.extname(tam).toLowerCase()];
    const etag = '"' + st.size.toString(36) + '-' + Math.floor(st.mtimeMs).toString(36) + '"';
    guvenlikBasliklari(res);
    const h = { 'Content-Type': tur, 'ETag': etag, 'Cache-Control': /\.(html|js|webmanifest)$/.test(tam) ? 'no-cache' : 'public, max-age=604800' };
    if (tur.startsWith('text/html')) h['Content-Security-Policy'] = "default-src 'none'; frame-ancestors 'none'";
    if (path.basename(tam) === 'sw.js') h['Service-Worker-Allowed'] = '/';
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, h); res.end(); return; }
    h['Content-Length'] = st.size;
    res.writeHead(200, h);
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(tam).pipe(res);
  });
}

/* ---------- istek yönlendirme ---------- */
async function istek(req, res) {
  let url;
  try { url = new URL(req.url, 'http://x'); } catch (e) { return hata(res, 400, 'Geçersiz adres.'); }
  if (!url.pathname.startsWith('/api/')) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return hata(res, 405, 'İzin verilmeyen yöntem.');
    return dosya(req, res, url);
  }
  const r = API.find(x => x.yontem === req.method && x.desen.test(url.pathname));
  if (!r) return hata(res, 404, 'Bulunamadı.');
  const p = url.pathname.match(r.desen);
  if (req.method !== 'GET' && !ayniSite(req)) return hata(res, 403, 'İstek reddedildi (başka siteden).');
  let b = {};
  if (req.method === 'POST') { try { b = await govde(req); } catch (e) { return hata(res, e.kod || 400, e.kod === 413 ? 'İstek çok büyük.' : 'Geçersiz istek.'); } }
  if (!b || typeof b !== 'object' || Array.isArray(b)) return hata(res, 400, 'Geçersiz istek.');
  let k = null, rol = null;
  if (!r.opt.acik) {
    k = kimdir(req);
    if (!k) return hata(res, 401, 'Oturum kapalı; yeniden giriş yap.');
    if (r.opt.ekip) {
      rol = rolOf(p[1], k.id);
      if (!rol) return hata(res, 403, 'Bu ekibin üyesi değilsin.');
    }
  }
  try { await r.fn(req, res, p, b, k, rol, url); }
  catch (e) { console.error(e); if (!res.headersSent) hata(res, 500, 'Sunucuda bir hata oldu.'); }
}

/* ---------- yedek: her gece, son 14 gün ---------- */
function yedekAl() {
  const gun = new Date().toISOString().slice(0, 10), hedef = path.join(AYAR.veri, 'yedek', 'whitenote-' + gun + '.db');
  try { fs.rmSync(hedef, { force: true }); db.exec("VACUUM INTO '" + hedef.replace(/'/g, "''") + "'"); fs.chmodSync(hedef, 0o600); }
  catch (e) { console.error('Yedek alınamadı:', e.message); return null; }
  const eski = fs.readdirSync(path.join(AYAR.veri, 'yedek')).filter(f => /^whitenote-\d{4}-\d{2}-\d{2}\.db$/.test(f)).sort();
  eski.slice(0, Math.max(0, eski.length - 14)).forEach(f => fs.rmSync(path.join(AYAR.veri, 'yedek', f), { force: true }));
  // 90 günden eski silme izleri ve süresi dolan oturum / davetler temizlenir. Silme izi temizlenen ekiplerde
  // o kadar eskiden kalan cihazlar listenin tamamını alır (temiz = temizlenen en büyük sıra).
  const s = Date.now(), sinir = s - 90 * GUN;
  tx(() => {
    Q('UPDATE ekip SET temiz = MAX(temiz, COALESCE((SELECT MAX(sira) FROM kayit WHERE kayit.ekip = ekip.id AND d IS NULL AND t < ?), 0))').run(sinir);
    Q('DELETE FROM kayit WHERE d IS NULL AND t < ?').run(sinir);
  })();
  Q('DELETE FROM oturum WHERE bitis < ?').run(s);
  Q('DELETE FROM davet WHERE bitis < ? OR kalan < 1').run(s);
  Q('DELETE FROM gunluk WHERE zaman < ?').run(s - 180 * GUN);
  // 180 günden eski etkinlik ve eski sürümler; ekiplerin eski sürüm boyutu yeniden hesaplanır
  Q('DELETE FROM olay WHERE t < ?').run(s - 180 * GUN);
  Q('DELETE FROM onceki WHERE t < ?').run(s - 180 * GUN);
  Q('UPDATE ekip SET gboyut = COALESCE((SELECT SUM(b) FROM onceki WHERE onceki.ekip = ekip.id), 0)').run();
  return hedef;
}
function geceYedegi() {
  const s = new Date(), hedef = new Date(s); hedef.setHours(3, 30, 0, 0);
  if (hedef <= s) hedef.setDate(hedef.getDate() + 1);
  setTimeout(() => { yedekAl(); geceYedegi(); }, hedef - s).unref();
}

/* ---------- komut satırı ---------- */
/* Satır okuyucu: boru ile verilen satırlar (kurulum betiği) de kaybolmasın diye satırlar sıraya alınır */
let rlOrtak = null, gizliMi = false;
const satirlar = [], bekleyenler = [];
function sor(soru, gizli) {
  const tty = !!process.stdin.isTTY;
  if (!rlOrtak) {
    rlOrtak = require('node:readline').createInterface({ input: process.stdin, output: tty ? process.stdout : undefined, terminal: tty });
    if (tty) { const yaz = rlOrtak._writeToOutput.bind(rlOrtak); rlOrtak._writeToOutput = x => { if (!gizliMi) yaz(x); }; }   // şifre ekrana yazılmaz
    rlOrtak.on('line', l => { if (bekleyenler.length) bekleyenler.shift()(l); else satirlar.push(l); });
    rlOrtak.on('close', () => { while (bekleyenler.length) bekleyenler.shift()(''); });
  }
  process.stdout.write(soru);
  gizliMi = !!gizli;
  return new Promise(ok => {
    const bitir = l => { gizliMi = false; if (gizli || !tty) process.stdout.write('\n'); ok(l); };
    if (satirlar.length) bitir(satirlar.shift()); else bekleyenler.push(bitir);
  });
}
function sunucuCalisiyor() {   // aynı bağlantı noktasında bir sunucu cevap veriyor mu?
  return new Promise(ok => {
    const s = net.connect(AYAR.port, AYAR.host);
    s.setTimeout(800);
    s.on('connect', () => { s.destroy(); ok(true); });
    s.on('timeout', () => { s.destroy(); ok(false); });
    s.on('error', () => ok(false));
  });
}
async function komut(argv) {
  const [k, ad] = argv;
  const kul = () => Q('SELECT * FROM kullanici WHERE ad = ?').get(String(ad || '').toLowerCase());
  if (k === 'kullanici-ekle') {
    const a = String(ad || '').toLowerCase();
    if (!AD_RE.test(a)) { console.error('Kullanıcı adı 3–32 karakter: küçük harf, rakam, . _ -'); process.exit(1); }
    if (Q('SELECT 1 FROM kullanici WHERE ad = ?').get(a)) { console.error('Bu kullanıcı zaten var.'); process.exit(1); }
    const s1 = await sor('Şifre: ', true), s2 = await sor('Şifre (tekrar): ', true);
    if (s1 !== s2) { console.error('Şifreler aynı değil.'); process.exit(1); }
    const u = sifreUygun(s1); if (u) { console.error(u); process.exit(1); }
    const gorunen = metin(await sor('Görünen ad (boş bırakılırsa kullanıcı adı): '), 60) || a;
    Q('INSERT INTO kullanici (id, ad, gorunen, sifre, olusturma, yonetici) VALUES (?, ?, ?, ?, ?, ?)').run(yeniId(), a, gorunen, sifreOzet(s1), Date.now(), argv.includes('--yonetici') ? 1 : 0);
    console.log('✓ ' + a + ' eklendi.');
  } else if (k === 'sifre-sifirla') {
    const u0 = kul();
    if (!u0) { console.error('Böyle bir kullanıcı yok.'); process.exit(1); }
    const s1 = await sor('Yeni şifre: ', true), s2 = await sor('Yeni şifre (tekrar): ', true);
    if (s1 !== s2) { console.error('Şifreler aynı değil.'); process.exit(1); }
    const u = sifreUygun(s1); if (u) { console.error(u); process.exit(1); }
    Q('UPDATE kullanici SET sifre = ?, oturum_surum = oturum_surum + 1 WHERE id = ?').run(sifreOzet(s1), u0.id);
    Q('DELETE FROM oturum WHERE kullanici = ?').run(u0.id);
    console.log('✓ Şifre değişti; açık oturumlar kapandı.');
  } else if (k === 'totp-kapat') {
    const r = Q('UPDATE kullanici SET totp = NULL, totp_son = 0 WHERE ad = ?').run(String(ad || '').toLowerCase());
    console.log(r.changes ? '✓ İki adımlı doğrulama kapatıldı.' : 'Böyle bir kullanıcı yok.');
  } else if (k === 'kullanici-kapat' || k === 'kullanici-ac') {
    const u0 = kul();
    if (!u0) { console.error('Böyle bir kullanıcı yok.'); process.exit(1); }
    if (k === 'kullanici-kapat') {
      Q('UPDATE kullanici SET kapali = 1, oturum_surum = oturum_surum + 1 WHERE id = ?').run(u0.id);
      Q('DELETE FROM oturum WHERE kullanici = ?').run(u0.id);
      console.log('✓ ' + u0.ad + ' kapatıldı; giriş yapamaz, açık oturumları kapandı.');
    } else {
      Q('UPDATE kullanici SET kapali = 0 WHERE id = ?').run(u0.id);
      console.log('✓ ' + u0.ad + ' yeniden açıldı.');
    }
  } else if (k === 'yedek-al') {
    const f = yedekAl(); console.log(f ? '✓ ' + f : 'Yedek alınamadı.');
  } else if (k === 'geri-yukle') {
    const kaynak = path.resolve(String(ad || ''));
    if (!ad || !fs.existsSync(kaynak) || !fs.statSync(kaynak).isFile()) { console.error('Yedek dosyası bulunamadı: ' + (ad || '(verilmedi)')); process.exit(1); }
    try { const t = new DatabaseSync(kaynak, { readOnly: true }); t.prepare('SELECT COUNT(*) FROM kayit').get(); t.prepare('SELECT COUNT(*) FROM kullanici').get(); t.close(); }
    catch (e) { console.error('Bu dosya bir White Note yedeği değil: ' + e.message); process.exit(1); }
    if (await sunucuCalisiyor()) { console.error('Sunucu çalışıyor; önce durdur: sudo systemctl stop whitenote'); process.exit(1); }
    db.close();
    const gecici = VERITABANI + '.geri';
    fs.copyFileSync(kaynak, gecici);
    fs.chmodSync(gecici, 0o600);
    for (const ek of ['-wal', '-shm']) fs.rmSync(VERITABANI + ek, { force: true });
    fs.renameSync(gecici, VERITABANI);
    veritabaniAc();
    Q("INSERT OR REPLACE INTO ayar VALUES ('donem', ?)").run(rastgele(9));   // cihazlar her şeyi baştan alsın
    db.close();
    console.log('✓ Yedek geri yüklendi. Sunucuyu başlat: sudo systemctl start whitenote');
  } else if (k === 'kullanicilar') {
    Q('SELECT ad, gorunen, yonetici, kapali, totp IS NOT NULL t FROM kullanici ORDER BY ad').all()
      .forEach(x => console.log(x.ad.padEnd(20) + x.gorunen.padEnd(24) + (x.yonetici ? 'yönetici ' : '') + (x.t ? '2adım ' : '') + (x.kapali ? 'KAPALI' : '')));
  } else { console.error('Bilinmeyen komut. Komutlar: kullanici-ekle, sifre-sifirla, totp-kapat, kullanici-kapat, kullanici-ac, kullanicilar, yedek-al, geri-yukle'); process.exit(1); }
  process.exit(0);
}

if (process.argv[2]) komut(process.argv.slice(2));
else {
  const sunucu = http.createServer((req, res) => { istek(req, res).catch(e => { console.error(e); try { hata(res, 500, 'Sunucuda bir hata oldu.'); } catch (x) {} }); });
  sunucu.headersTimeout = 20000;
  sunucu.requestTimeout = 60000;
  sunucu.keepAliveTimeout = 30000;
  sunucu.maxConnections = 1000;
  sunucu.listen(AYAR.port, AYAR.host, () => console.log('White Note sunucusu: http://' + AYAR.host + ':' + AYAR.port + ' · veri: ' + AYAR.veri + ' · uygulama: ' + AYAR.uygulama));
  geceYedegi();
  const kapat = () => { sunucu.close(); for (const set of dinleyiciler.values()) for (const d of set) { try { d.res.end(); } catch (e) {} } try { db.close(); } catch (e) {} process.exit(0); };
  process.on('SIGTERM', kapat);
  process.on('SIGINT', kapat);
}
