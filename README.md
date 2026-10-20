# White Note

Not, görev, Trello tarzı pano, takvim, **SQLite veritabanı şema tasarımcısı** ve **algoritma / akış şeması
tasarımcısı** bir arada.
Tek bir `index.html` dosyasından oluşur; kurulum gerektirmez, tarayıcıda çalışır.
Telefona ya da bilgisayara **uygulama olarak yüklenebilir** ve internetsiz de açılır.

**Canlı sürüm:** https://acemividyolar-alt.github.io/white_not/

## Görünüş

"Mühendislik defteri" fikriyle tasarlandı: beyaz sayfalar, tükenmez kalem mavisi, Şema ve Akış'ta
kareli kâğıt zemin. Açık proje, seçili görünüm, arama eşleşmeleri, takvimde bugün ve çalışan adım
fosforlu kalem sarısıyla işaretlenir. Gece görünümü lacivert "mavi kopya" (blueprint) zeminidir;
ilk açılışta cihazın gece / gündüz ayarına uyar, ay / güneş düğmesiyle değiştirilir.
Telefonda görünümler ekranın altındaki sekme çubuğundadır, pencereler alttan açılır.

## Görünümler

### Liste
- Not ve görev ekleme, etiketler (`virgülle`), sabitleme
- Arama Türkçe harf ve büyük/küçük harf farkı gözetmez (`odev` → "Ödev"), kelimeler ayrı ayrı aranır;
  **etikete tıklayınca** liste o etikete süzülür (`#etiket` yazmak da olur)
- **Son tarih:** görevlere ve notlara tarih verilir; gecikenler kırmızı, bugünküler sarı görünür,
  "Gecikenler / Bugün / 7 gün içinde" süzgeçleri ve kenar çubuğunda gecikmiş sayısı
- **Markdown:** `**kalın**`, `*italik*`, `# başlık`, `- madde`, `1. sıralı`, `> alıntı`, `` `kod` ``,
  bağlantı ve **işaretlenebilir kontrol listesi** (`- [ ] yapılacak`) — maddeler kartın üstünden
  işaretlenir, ilerleme (☑ 2/5) görünür
- Görev ilerleme çubuğu
- Karta tıklayınca düzenleme penceresi (açıklama, etiket, tür, sütun, son tarih, kapak resmi)

### Takvim
- Son tarihi olan not ve görevler aylık takvimde; güne tıklayınca o günün listesi
- O güne doğrudan görev ekleme, görevi oradan tamamlama, "Tüm projeler" seçeneği

### Pano
- Trello tarzı sütunlar: ekle, yeniden adlandır, renk ver, sil
- Kartları sütunlar arasında ve sütun içinde **sürükleyerek** taşı
  (telefonda karta kısa süre basılı tut, sonra sürükle)
- Sütunları başlığından tutup **sürükleyerek** sırala
- "Bitti" benzeri sütuna taşınan görev otomatik tamamlanır

### Şema (SQLite tasarımcısı)
- Serbest tuvalde tablolar; başlığından tutup istediğin yere taşı
- **İlişki kurmak:** bir alanı (ör. `hasta.musteri_id`) tutup başka tablodaki alana
  (ör. `musteri.id`) bırak. Ana id'yi bir tablonun üzerine bırakırsan `musteri_id`
  alanı kendiliğinden oluşur ve bağlanır.
- Alan özellikleri: PK, AUTOINCREMENT, NOT NULL, UNIQUE, DEFAULT, CHECK
- İlişki ayarları: ON DELETE / ON UPDATE (CASCADE, SET NULL, RESTRICT…), 1/N gösterimi
- İndeksler (artan/azalan), istersen yabancı anahtarlara otomatik indeks
- SQLite'ın çalışırken vereceği hataları önceden gösteren kontrol
  (ör. "foreign key mismatch", `INT PRIMARY KEY` tuzağı)
- **SQL çıktısı:** SQLite, MySQL, PostgreSQL, SQL Server
- **Gerçek SQLite motoru** (tarayıcıda, [sql.js](https://sql.js.org)):
  - "SQLite'ta dene" ile şemayı doğrulama
  - Konsol: veri ekle, sorgu yaz, sonuçları tablo olarak gör
  - `.db` / `.sqlite` dosyası indirme
  - Var olan `.db` / `.sqlite` / `.sql` dosyasını içe aktarma
- Geri al / yinele (Ctrl+Z / Ctrl+Y), otomatik yerleştir, ekrana sığdır, tabloya git
- Diyagramı PNG / SVG olarak indirme

### Akış (algoritma / akış şeması)
- **Bir projede birden çok akış şeması** (sekmeler): yeni şema, yeniden adlandır, çoğalt, sil
- Standart şekiller: Başla/Bitir (oval), Giriş ve Çıkış (paralelkenar), İşlem (dikdörtgen),
  Karar (eşkenar dörtgen, Evet/Hayır çıkışlı), Döngü (altıgen, `i = 1 .. 10` gibi sayaçlı)
- **Hızlı kurma:** bir şekli seç, soldaki şablondan yenisine tıkla — altına eklenir ve okla bağlanır
  (karar şeklinde ilk çıkış Evet, ikincisi Hayır olur ve sağa yerleşir)
- Şekli tutup taşı; kenarındaki noktadan tutup başka şekle bırakarak ok çiz; oka tıklayıp
  Evet/Hayır, çıktığı kenar, yön ve silme ayarlanır. Oklar dik açılı ve kendiliğinden yönlenir
- **Algoritmadan şema:** algoritmayı yaz, akış şeması kendiliğinden çizilsin. Anlaşılan yazım:
  - `Oku a, b` · `toplam = a + b` · `Yaz "Toplam:", toplam`
  - `Eğer a > b ise` … `Değilse` … (girintiyle ya da `Eğer sonu` ile), `Değilse eğer`
  - `İken i <= n` · `İçin i = 1 .. n` (`i = 1'den 10'a kadar adım 2`) · `5 kez tekrarla`
  - `Tekrarla` … `tahmin = gizli olana kadar`
  - Numaralı biçim: `Adım 4: Eğer x > 0 ise Adım 6'ya git` · `Adım 7: Adım 3'e git`
  - İngilizce anahtar kelimeler de olur (`IF / ELSE / WHILE / FOR / INPUT / PRINT`)
- **Şemadan algoritma:** şema "Adım 1: Başla …" biçiminde numaralı adımlara çevrilir
  (kopyala / .txt indir); bu metin tekrar şemaya çevrilebilir
- **Koda çevir:** şema **C#** (konsol uygulaması), **Python** ya da sözde koda çevrilir.
  Eğer / İken / İçin yapıları gerçek `if` / `while` / `for` olur; iç içe geçen "git"ler varsa
  durum makinesi yazılır. Veritabanı gibi açıklama adımları `// TODO` boş metotlar olarak çıkar.
- **Çalıştır:** şema adım adım yürütülür; sıradaki şekil fosforlu kalemle, geçilen ok yeşil gösterilir,
  değişkenler ve ekran çıktısı izlenir, Giriş şeklinde değer sorulur. Hız seçilebilir,
  sonsuz döngüye karşı adım sınırı vardır. İfadeler güvenli bir ayrıştırıcıyla hesaplanır
  (`+ - * / mod ^`, `= <> < > <= >=`, `ve veya değil`, `karekök() mutlak() yuvarla() tam() rastgele(a, b)`)
- **? düğmesi:** "Şekiller ne işe yarar?" hatırlatması — her şeklin anlamı, kısa örneği ve
  tek tıkla ekleme (klavyede `?` tuşu da açar)
- Hata kontrolü: Başla yok, kararın iki çıkışı yok, bağlanmamış adım, ulaşılamayan adım…
- Otomatik yerleştir, ekrana sığdır, geri al / yinele, PNG / SVG indirme
- Hazır örnekler: toplam, büyük olanı bul, not harfi, faktöriyel, asal sayı, sayı tahmin oyunu
  ve bu uygulamanın kendi çalışma akışı

## Her yerde ara (Ctrl+K)

Kenar çubuğundaki "Her yerde ara" (telefonda üstteki büyüteç), `Ctrl+K` ya da `/` bir arama penceresi
açar: bütün projelerdeki notlar, görevler, şema tabloları ve alanları, akış şemaları ve adımları
birlikte aranır. Ok tuşlarıyla seçip Enter'a basınca ilgili proje ve görünüm açılır, adım ya da
tablo işaretlenir.

## Çöp kutusu

Silinen not, görev, akış şeması ve projeler **30 gün** çöp kutusunda durur. Silince altta çıkan
**Geri al** ile hemen, kenar çubuğundaki **Çöp kutusu**ndan sonra geri alınır; oradan kalıcı silme
ve boşaltma da yapılır.

## Uygulama olarak yükleme

Dışa / İçe aktar → **Telefona / bilgisayara yükle**. Chrome ve Edge doğrudan yükler; iPhone'da
Safari'nin Paylaş → **Ana Ekrana Ekle** adımı gösterilir. Yüklenen uygulama kendi simgesiyle,
tarayıcı çubukları olmadan açılır ve internetsiz çalışır (`sw.js`).

## Veriler nerede?

- Her şey bu cihazın tarayıcısında (`localStorage`) saklanır; hiçbir sunucuya gönderilmez.
- Tarayıcılar bu alana sınır koyar (çoğunda yaklaşık 5 MB). Kapak resimleri bu yüzden
  otomatik küçültülür; kullanılan alan liste görünümünün altında görünür.
- Başka cihaza taşımak ya da yedeklemek için: **Dışa / İçe aktar → JSON yedeği indir / yükle**.
  Yüklerken iki seçenek var: **Mevcutlara ekle** (projeleri tek tek seçip ekler; hiçbir kaydın üstüne
  yazmaz, aynı ada "(2)" ekler) ya da **Hepsini değiştir** (önce şu anki verinin yedeği indirilir).
- Notlar ayrıca Markdown, düz metin ve PDF olarak dışa aktarılabilir (şema SQL'i ve akış
  şemasının algoritma adımları dahil).

## Notlar

- SQLite motoru (konsol, "SQLite'ta dene", `.db` indirme ve içe aktarma) ilk kullanımda
  internetten bir kez yüklenir (~650 KB). Diyagram ve SQL üretimi internetsiz çalışır.
- Uygulamanın tamamı `index.html` içindedir. Yanındaki dosyalar: `sw.js` ve `manifest.webmanifest`
  (uygulama olarak yükleme, internetsiz çalışma), `icons/` (simgeler), `fonts/` (Recursive yazı tipi,
  SIL Open Font License). Sadece `index.html` indirilse de çalışır; o zaman sistem yazı tipi kullanılır.
  `script.js` ve `style.css` eski bir sürümden kalmadır ve kullanılmaz.

## Kısayollar

| Kısayol | Nerede | İş |
| --- | --- | --- |
| Ctrl+K (Mac'te ⌘K) ya da / | Her yerde | Tüm projelerde ara |
| Ctrl+Enter | Ekleme kutusu | Not/görev ekle |
| Ctrl+Enter | SQL konsolu | Çalıştır (seçili kısım varsa sadece o) |
| Ctrl+Z / Ctrl+Y | Şema, Akış | Geri al / yinele |
| Delete | Şema | Seçili ilişkiyi sil |
| Delete | Akış | Seçili şekli / oku sil |
| Enter / çift tık | Akış | Seçili şekli düzenle |
| Ctrl+Enter | Algoritma kutusu | Akış şemasını oluştur |
| ? | Akış | Şekiller ne işe yarar? (yardım) |
| Ctrl + tekerlek | Şema, Akış | Yakınlaştır / uzaklaştır |
| Esc | Her yerde | Açık pencereyi kapat |
