# White Note

Not, görev, Trello tarzı pano, takvim, **SQLite veritabanı şema tasarımcısı** ve **algoritma / akış şeması
tasarımcısı** bir arada.
Tek bir `index.html` dosyasından oluşur; kurulum gerektirmez, tarayıcıda çalışır.
Telefona ya da bilgisayara **uygulama olarak yüklenebilir** ve internetsiz de açılır.
**Ekip alanında** projeler ekip arkadaşlarınla birlikte, canlı olarak düzenlenir.

**Canlı sürüm:** https://acemividyolar-alt.github.io/white_not/

## Görünüş

"Mühendislik defteri" fikriyle tasarlandı: beyaz sayfalar, tükenmez kalem mavisi, Şema ve Akış'ta
kareli kâğıt zemin. Açık proje, seçili görünüm, arama eşleşmeleri, takvimde bugün ve çalışan adım
fosforlu kalem sarısıyla işaretlenir.
Telefonda görünümler ekranın altındaki sekme çubuğundadır; pencereler ve Şema / Akış'ın **Dosya** menüsü
alttan açılır, kısa bildirimler ("dizildi · Geri al" gibi) ekranın altında görünür.

Bilgisayarda başlık, sekmeler, arama ve içerik **her görünümde aynı genişlikte ve aynı yerde** durur;
Liste, Pano, Şema, Akış ve Takvim arasında geçince hiçbir şey kaymaz (Windows'ta kaydırma çubuğu çıksa
da). Çok geniş ekranlarda (1600 pikselden geniş içerik alanı) sayfa ortalanır. Sayfa açılırken de en son
tema, görünüm ve proje baştan doğru çizilir; açılışta yazılar büyüyüp küçülmez.

Proje adının solundaki **☰** düğmesi soldaki bölümü (projeler, arama, çöp kutusu) açar ve kapatır.
Telefonda çekmece olarak açılır. Bilgisayarda bölüm kayarak gizlenir ve içerik bütün genişliği kullanır;
kapalıyken "Her yerde ara" üst çubuktaki büyüteçte durur. Seçim o cihazda hatırlanır ve sayfa açılırken
baştan öyle çizilir.

### Temalar

Üst çubuktaki palet düğmesi tema menüsünü açar. Seçim o cihazda hatırlanır ve JSON yedeğine de yazılır.

| Tema | Görünüş |
| --- | --- |
| Otomatik | Cihazın gece / gündüz ayarına uyar; ayar değişince kendiliğinden değişir (ilk açılışta bu seçili) |
| Gündüz | Beyaz sayfa, tükenmez kalem mavisi |
| Kâğıt | Krem rengi defter sayfası, kahverengi mürekkep; göz yormaz |
| Gece mavisi | Lacivert "mavi kopya" (blueprint) zemin |
| Gece siyahı | Mavisiz, nötr koyu gri ve siyah; OLED ekranlarda pil dostu |
| Kara tahta | Koyu yeşil tahta, tebeşir beyazı yazı, sarı tebeşir işaret |

Bütün temalarda yerleşim ve yazı boyutları aynıdır; sadece renkler değişir. Koyu temalarda seçili
sekme sarı alt çizgiyle gösterilir (açık renk yazının üstüne sarı bant çizilmez, yazı her zaman okunur).

### Yazı boyutu ve yüksek karşıtlık

Aynı menünün altında:
- **Yazı boyutu:** Küçük · Normal · Büyük · Çok büyük — bütün arayüz (menüler, kartlar, pencereler) birlikte
  büyür
- **Yüksek karşıtlık:** soluk yazılar ve çizgiler her temada belirginleşir, klavyeyle gezerken odak
  çerçevesi kalınlaşır, bağlantıların altı çizilir. Seçilmemişse cihazın "daha fazla karşıtlık" ayarına uyar

İkisi de o cihazda hatırlanır, açık sekmelerin hepsine hemen uygulanır ve tema gibi JSON yedeğine de yazılır.

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
- Karta tıklayınca düzenleme penceresi (açıklama, etiket, tür, sütun, öncelik, alt görevler, son tarih, tekrar, kapak resmi)
- **Öncelik:** Yüksek / Orta / Düşük (ekleme kutusunda ve kart penceresinde); kartta renkli etiket olarak görünür
- **Alt görevler:** kart penceresinde ekle, işaretle, sırala, istersen her birine ayrı son tarih ver.
  İlk beşi liste kartında işaretlenebilir, panoda "↳ 2/5" görünür, tarihli olanlar takvimde çıkar.
  Hepsi bitince "Görevi tamamla" önerilir
- **Sıralama ve süzgeç:** Yeni → eski, son tarih, öncelik ya da ada göre; önceliğe göre süzme
- **Kayıtlı görünüm:** arama + süzgeç + sıralama birleşimini "☆ Görünümü kaydet" ile adlandır,
  sonra tek dokunuşla aç (projeye göre, bu cihazda)
- **Toplu işlem:** *Seç* ile kartlara dokun, alttaki çubuktan hepsini birden tamamla, etiket ekle,
  öncelik ya da son tarih ver, başka projeye taşı ya da çöp kutusuna at (Geri al ile hepsi geri gelir)
- **Şablonlar:** ekleme kutusundaki *Şablon* menüsünde hazır şablonlar (ders notu, toplantı notu,
  ödev planı, sınav hazırlığı…; `{tarih}` ve `{gün}` bugünle dolar). Kendi şablonun için kartı aç →
  *Şablon olarak kaydet*
- **Sesle yazma:** ekleme kutusunun ve kart penceresinin biçimlendirme çubuğundaki **mikrofon** düğmesine
  bas, konuş: söylediklerin (Türkçe) imlecin olduğu yere yazılır, tekrar basınca durur. Chrome, Edge ve
  Safari'de çalışır (Firefox'ta düğme görünmez). Chrome / Edge sesi tanımak için kendi sunucularına gönderir;
  ilk kullanımda bu söylenir ve onay istenir. Yazılan metin yine yalnız cihazda kalır
- **Paylaş:** kart penceresindeki **Paylaş** telefonun paylaş menüsünü açar (mesaj, e-posta…; başlık ve düz metin)
- **Notlar arası bağlantı:** içerikte `[[Not adı]]` yaz; tıklayınca o not açılır, yoksa oluşturulması önerilir.
  `[[` yazınca başlıklar önerilir; kart penceresinin altında "Bu nota bağlananlar" görünür;
  bir notun adı değişince ona giden bağlantılar da güncellenir
- **Tekrarlayan görev:** kart penceresinde *Her gün / Hafta içi her gün / Her hafta / Her ay / Her yıl*.
  Görev tamamlanınca bir sonraki tarihe yenisi açılır (tamamlanan geçmiş olarak kalır, panoda "Bitti"de durur);
  yenisinde kontrol listesi maddeleri işaretsiz başlar. Alttaki bildirimden **Geri al** ile vazgeçilir.
  Aylık tekrarda gün ayın sonuna sığdırılır ama unutulmaz (31 Ocak → 28 Şubat → 31 Mart).

### Takvim
- Son tarihi olan not ve görevler **Ay**, **Hafta** ya da **Gün** görünümünde; güne tıklayınca o günün listesi
- O güne doğrudan görev ekleme, görevi oradan tamamlama, "Tüm projeler" seçeneği
- **Saatli görevler:** kart penceresinde son tarihin yanına saat ve süre (15 dk – 4 saat) verilir; rozette
  "Bugün 14:30" görünür, saati geçen bugünkü görev gecikmiş sayılır
- **Gün görünümü:** üstte "Tüm gün" şeridi, altta saat çizelgesi (saatli görevler, o günün dersleri, kırmızı
  "şimdi" çizgisi). Çizelgede boş bir yere dokununca o saate görev eklenir
- **Sürükle bırak:** Ay / Hafta'da kartı başka güne bırakınca tarihi değişir (alt görevler de taşınır);
  Gün'de saatli kartı yukarı / aşağı çekince saati 15 dakikalık adımlarla değişir, "Tüm gün"e bırakınca saati
  kalkar, "Tüm gün"deki kartı çizelgeye bırakınca saat alır. Telefonda karta kısa süre basılı tutup sürükle.
  Her taşımadan sonra alttaki bildirimden **Geri al**
- Tekrarlayan görevlerin ileriki günleri takvimde soluk ve kesik çizgili görünür; tamamlanınca açılan yeni
  kopya saati, süreyi, önceliği ve (işaretsiz) alt görevleri taşır
- Tarihli alt görevler takvimde "↳" ile görünür ve günün listesinden işaretlenir
- **Hatırlat:** açınca (tarayıcı bildirim izni ister) bugün, yarın ve gecikmiş görevler için bildirim gelir;
  saatli görevler için ayrıca **15 dakika kala**. Sayfa açılınca, sekmeye dönünce ve açıkken dakikada bir bakılır.
  Sunucu olmadığı için tarayıcı tamamen kapalıyken bildirim gelmez.
- **Takvim dosyası (.ics) dışa aktar:** *Dışa / İçe aktar → Takvim dosyası* son tarihli not ve görevleri Google Takvim,
  Outlook ya da telefonun takvimine aktarılabilen dosyaya yazar (saatliler saatiyle, tekrarlayanlar tekrar kuralıyla).
  Google Takvim'de: Ayarlar → İçe ve dışa aktar → İçe aktar.
- **Takvim dosyası (.ics) yükle:** *Dışa / İçe aktar → Takvim dosyası yükle* Google Takvim, Outlook ya da okulun
  takviminden alınan dosyadaki etkinlikleri ve yapılacakları açık projeye ekler: saat (saat dilimi dahil), süre,
  yer, açıklama, kategoriler (etiket olur) ve tekrar (her gün / hafta içi / her hafta / her ay / her yıl).
  Geçmişte başlamış tekrarlayan etkinlik bu haftaya kaydırılır; geçmiş tarihliler istenirse alınır;
  iptal edilenler alınmaz. Aynı dosya tekrar yüklenirse daha önce eklenenler tekrar eklenmez
- **Ders programı (Program):** haftalık ders çizelgesi. Hazır saatlerle başla (okul: 40 dk ders / 10 dk teneffüs,
  üniversite: 50 dk) ya da saatleri kendin ekle; kutuya dokunup ders adını, dersliği / öğretmeni yaz, renk seç
  (aynı ders her yerde aynı renkte). Cumartesi / Pazar eklenebilir, saatler düzenlenebilir, **yazdırılabilir**.
  Dersler Gün görünümünde de çıkar; derse dokununca (ya da ders penceresinde *Bu derse ödev ekle*) teslim tarihi
  **bir sonraki o ders** olan bir ödev eklenir. Program projeye kayıtlıdır (yedekle, ekiple ve GitHub'la gider)

### Pano
- Trello tarzı sütunlar: ekle, yeniden adlandır, renk ver, sil
- Kartları sütunlar arasında ve sütun içinde **sürükleyerek** taşı
  (telefonda karta kısa süre basılı tut, sonra sürükle)
- Sütunları başlığından tutup **sürükleyerek** sırala
- "Bitti" benzeri sütuna taşınan görev otomatik tamamlanır; başka bir sütunu da menüden **Bitti sütunu** yapabilirsin
- **Kart sınırı (Kanban WIP):** sütun menüsünden "aynı anda en fazla şu kadar kart" sınırı; başlıkta 3/5 görünür,
  sınır dolunca sarı, aşılınca kırmızı olur ve uyarı çıkar (kart yine de taşınır)
- **Pano şablonları:** *Pano şablonu* menüsünde hazır sütun düzenleri (Kanban, Ödev takibi, Proje, Sınav dönemi,
  Haftalık plan, Hata takibi, Okuma listesi). Kartı olan sütunlar yerinde kalır, boş sütunlar kaldırılır;
  **Geri al** ile eski hâline döner. Kendi panonu da şablon olarak kaydedebilirsin (bu cihazda)

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
- **Tasarım ipuçları (normalizasyon):** durum satırındaki "N ipucu" düğmesi ve SQL penceresi. Tekrar eden alan
  grupları (`telefon1`, `telefon2` → 1NF), çok değerli metin alanları (`etiketler`), bileşik anahtarın bir
  parçasına bağlı alanlar (2NF), bağlı tablodaki bilgiyi kopyalayan alanlar (`siparisler.musteri_adi` → 3NF),
  hesaplanabilen veriler (yaş ↔ doğum tarihi, toplam ↔ adet × fiyat), çizilmemiş ilişkiler (`musteri_id`
  var ama bağ yok), sayı türünde tutulan telefon / TC, farklı türlerdeki aynı adlı alanlar. İpucuna
  tıklayınca o tabloya gidilir
- **SQL çıktısı:** SQLite, MySQL, PostgreSQL, SQL Server
- **Değişiklik (göç) SQL'i — ALTER:** SQL penceresinde *Değişiklikler (ALTER)*. Şemanın bir hâlini **sürüm
  olarak kaydet**; sonra yaptığın değişiklikler (yeni / silinen tablo ve alan, ad değişikliği, tür ve kısıt
  değişikliği, yeni ilişki, indeks) o sürümdeki bir veritabanını verileriyle bugünkü şemaya getiren SQL olarak
  çıkar. Ad değişikliği silip yeniden eklemek değil `RENAME` olur. SQLite'ın ALTER'ı kısıtlı olduğu için tür /
  kısıt / ilişki değişikliğinde tablo yeniden kurulur ve veriler kopyalanır; MySQL'de `MODIFY COLUMN`,
  PostgreSQL'de `ALTER COLUMN … TYPE`, SQL Server'da `sp_rename` / `ALTER COLUMN` kullanılır.
  **Göçü SQLite'ta dene:** kayıtlı sürümden veritabanı kurulur, örnek veri eklenir, değişiklikler uygulanır ve
  sonuç bugünkü şemayla karşılaştırılır. Sürüm projeyle birlikte saklanır (yedek, ekip, GitHub)
- **Ödev çıktısı / veri sözlüğü:** *Dosya → Ödev çıktısı (PDF)*: ad, sınıf, tarih; varlık-ilişki diyagramı,
  veri sözlüğü (her tablo için alan, tür, anahtar, boş olabilir mi, varsayılan, kural, ilişkiler, indeksler),
  istenirse tasarım değerlendirmesi, seçilen türde SQL ve kayıtlı sorgular sonuçlarıyla. *Dosya → Veri sözlüğü
  (.md)* aynı sözlüğü Markdown olarak indirir
- **Gerçek SQLite motoru** (tarayıcıda, [sql.js](https://sql.js.org)):
  - "SQLite'ta dene" ile şemayı doğrulama
  - Konsol: veri ekle, sorgu yaz, sonuçları tablo olarak gör. Komutlar tek tek çalışır; biri hata verirse
    hangi komutun neden durduğu Türkçe açıklanır (ör. "Bu değer zaten var", "boş bırakılamaz") ve
    **Bu komutu atla, kalanları çalıştır** ile devam edilebilir
  - **SQL türü seçimi (konsol):** SQLite, MySQL / MariaDB, PostgreSQL, SQL Server. SQLite dışındaki yazımlar
    çalıştırılmadan önce SQLite'a çevrilir ve çevrilen hâli sonucun altında görünür: `AUTO_INCREMENT` /
    `SERIAL` / `IDENTITY`, `ENUM`, `ENGINE=…`, `TOP n`, `OFFSET … FETCH`, `N'…'`, `GO`, `x::int`, `ILIKE`,
    `EXTRACT`, `INTERVAL`, `NOW()` / `GETDATE()`, `DATEDIFF`, `DATEADD`, `LEN`, `LEFT`, `CONCAT`,
    `DATE_FORMAT`, `CONVERT(…, 104)`, `INSERT IGNORE`, `ON DUPLICATE KEY UPDATE`, `OUTPUT INSERTED`,
    `SELECT … INTO`; `SHOW TABLES`, `DESCRIBE`, `\dt`, `sp_help`, `INFORMATION_SCHEMA` gibi komutlar da
    çalışır. SQLite'ta olmayanlar (`DECLARE`, saklı yordam, `ALTER COLUMN` …) Türkçe açıklamayla durur.
    Motor yine SQLite olduğu için her ayrıntı birebir aynı olmayabilir
  - **Örnek veri ekle:** her tabloya 10 satır anlamlı Türkçe deneme verisi (ad, soyad, telefon,
    e-posta, il/ilçe, tarih, fiyat, geçerli TC kimlik numarası…). Sütun adına, türüne ve CHECK
    kısıtlarına göre üretilir; yabancı anahtarlar gerçek satırlara bağlanır, UNIQUE alanlar tekrar etmez.
    **Verileri şemaya kaydet** ile konsolda eklenen satırlar şemanın "Ek SQL" kısmına `INSERT` olarak
    yazılır (önce denenir; böylece `.db` indirince ve "SQLite'ta dene"de de gelir)
  - **Sorgu oluşturucu:** SQL yazmadan sorgu: tablo seç, ilişkili tabloları ekle (yabancı anahtarlardan JOIN
    ya da LEFT JOIN), sütunları işaretle (istenirse say / topla / ortalama / en küçük / en büyük; GROUP BY
    kendiliğinden), koşul ekle (=, ≠, >, içerir, ile başlar, listede, boş…; VE / VEYA), sırala, satır
    sınırı koy. SQL konsolun seçili türünde yazılır (SQL Server'da `TOP`); editöre yazılır ya da çalıştırılır
  - **Geçmiş:** çalıştırılan son 30 sorgu (bu cihazda, projeye göre). **Kayıtlı sorgular:** adıyla kaydedilen
    sorgular projeyle birlikte saklanır (yedek, ekip, GitHub) ve ödev çıktısına sonuçlarıyla eklenebilir
  - **CSV indir:** her sonuç tablosu Excel'in doğrudan açtığı CSV olarak indirilir (`;` ayırıcı, virgüllü
    ondalık, Türkçe harfler için UTF-8 BOM; `=`, `+`, `-`, `@` ile başlayan metinler formül olarak çalışmaz)
  - `.db` / `.sqlite` dosyası indirme
  - Var olan `.db` / `.sqlite` / `.sql` dosyasını içe aktarma
- Geri al / yinele (Ctrl+Z / Ctrl+Y), ekrana sığdır, tabloya git
- **Yerleştir:** tablolar ilişkilerine göre sütunlara dizilir; telefonda okunur kalsın diye alt alta
  dizilir (alttaki bildirimden **Geri al**)
- Diyagramı PNG / SVG olarak indirme

### Akış (algoritma / akış şeması)
- **Bir projede birden çok akış şeması** (sekmeler): yeni şema, yeniden adlandır, çoğalt, sil
- Standart şekiller: Başla/Bitir (oval), Giriş ve Çıkış (paralelkenar), İşlem (dikdörtgen),
  Karar (eşkenar dörtgen, Evet/Hayır çıkışlı), Döngü (altıgen, `i = 1 .. 10` gibi sayaçlı)
- **Yeni şekiller:**
  - **Alt program** (iki yanı çift çizgili dikdörtgen): projedeki başka bir akış şemasını (sekmeyi) adıyla
    çalıştırır (`Hesapla`). Yazıda `Alt program Hesapla` ya da `Çağır Hesapla`.
    - Parametresiz ve değer döndürmeyen alt program ana şemanın değişkenlerini kullanır (koda çevirirken
      doldurulacak metot olur)
    - **Parametre ve dönüş değeri:** alt programın Başla'sı `Başla(a, b)` ise değer alır, Bitir'i
      `Bitir(sonuc)` ya da `Döndür sonuc` ise değer döndürür; böyle bir alt program kendi değişkenleriyle
      çalışır. Çağrı: `Topla(x, 5)` ya da `s = Topla(x, 5)`; ifadelerde de olur: `Yaz Faktoriyel(5)`,
      `Eğer AsalMi(n) ise`. Kendini çağırabilir (özyineleme, en fazla 100 derinlik). Aynı adlı hazır
      fonksiyon varsa (ör. `Toplam`) değer döndüren alt program önce gelir
    - Alt program şeması kendi başına çalıştırılırsa önce parametreler sorulur, sonunda `Sonuç: …` yazılır
    - Alt programda Giriş (Oku) varsa çalıştırma onun şemasına geçip değeri orada sorar
    - **Koda çevirirken** parametreli / değer döndüren alt programlar gövdesiyle gerçek fonksiyon olur
      (parametre ve dönüş türleri çağrılardan çıkarılır; C'de dizi parametresi `double A[], int A_n`);
      yazılamayan durumda (C'de dizi döndürmek gibi) çağrı `// TODO` metot olarak kalır
  - **Bağlantı noktası** (daire): uzak iki yeri ok çizmeden bağlar. Devamı olmayan `A` noktasına gelince,
    aynı harfli ve oku olan `A` noktasından devam edilir (yazıda `Bağlantı A`). Devamı olmayan ya da birden
    çok çıkışlı aynı harf hata kontrolünde gösterilir
  - **Yorum notu** (köşesi kıvrık kâğıt): açıklama yazısı; ok bağlanmaz, çalıştırılmaz, algoritmaya ve koda
    girmez, "Yerleştir" onu yerinden oynatmaz
- **Çoklu seçim:** Shift (ya da Ctrl) + tıkla, Shift + boş yerde sürükle (seçim dikdörtgeni), Ctrl+A hepsi.
  Telefonda araç çubuğundaki **çoklu seçim** düğmesi (kesik çizgili kutu): dokunulan şekiller seçime eklenir. Seçili şekiller birlikte taşınır; seçim
  çubuğunda **Kopyala · Yapıştır · Çoğalt · Sil · Hepsi**. Ctrl+C / Ctrl+X / Ctrl+V / Ctrl+D; kopyalanan
  şekiller aralarındaki oklarla birlikte başka şemaya ya da projeye de yapıştırılır (pano bu cihazda saklanır)
- **Hizalama kılavuzu:** şekli sürüklerken başka bir şeklin hizasına gelince kesik çizgi çıkar ve oraya oturur
- **Mini harita** (araç çubuğunda, köşesinde küçük kutu olan çerçeve simgesi): şema ekrana sığmayınca sağ altta küçük bir özet; tıklayınca / sürükleyince
  oraya gidilir
- **Yan yana** görünüm (araç çubuğunda iki bölmeli simge): solda algoritma yazısı, sağda şema. Yazdıkça (biraz durunca) şema yeniden çizilir —
  Python yazılırsa çevrilir; şema başka yoldan değişince yazı da yenilenir. Yorum notları korunur
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
  - Alt program: `Başla(n)` … `Döndür sonuc`; bir kutuda birden çok şema: `# Alt program: Ad` satırından
    sonrası o adla ayrı şema olur (aynı adlı şema varsa sorulup yerine yazılır)
  - İngilizce anahtar kelimeler de olur (`IF / ELSE / WHILE / FOR / INPUT / PRINT`)
- **Diziler (listeler):** `A = [3, 1, 2]`, `A = dizi(5, 0)` (beş tane 0), `Dizi A[10]`, iç içe `M[i][j]`.
  Sıra numaraları 0'dan başlar: `A[0]` ilk eleman, `A[i] = 7` ile değişir, `Oku A[i]` ile okunur,
  `ekle(A, x)` sona ekler. `uzunluk(A)` `toplam(A)` `min(A)` `max(A)` `ters(A)`. Olmayan bir elemana
  ulaşılınca ne olduğu Türkçe anlatılır (`A[3] yok: A içinde 3 eleman var (A[0] … A[2])`).
  `B = A` aynı diziyi gösterir (Python'daki gibi). En fazla 1.000.000 eleman.
- **Metin fonksiyonları:** `s[0]` (harf), `uzunluk(s)`, `parça(s, 1, 3)`, `büyükharf(s)` `küçükharf(s)`
  (Türkçe i/İ, ı/I), `içerir(s, "a")`, `bul(s, "a")` (yoksa -1), `ters(s)`, `kırp(s)`,
  `değiştir(s, "a", "e")`, `kod("A")` → 65, `karakter(65)` → "A". Türkçe harfler (ç, ğ, İ …) her
  dilde tek harf sayılır
- **Adım numaralarını kendiliğinden yaz** (kutunun üstünde, varsayılan açık; cihazda hatırlanır):
  - Boş kutuya yazmaya başlayınca satırın başına `Adım 1: ` gelir; Enter'a basınca alt satıra sıradaki
    `Adım N: ` yazılır. `Eğer … ise`, `İken`, `İçin`, `Değilse` gibi blok açan satırdan sonra bir içeride başlar.
  - Araya adım eklenince ya da numaralı satır silinince aşağıdaki adımlar ve onlara giden `Adım N'e git`ler
    kendiliğinden kayar (ekler de uyar: `Adım 5'e` → `Adım 6'ya`).
  - Her Enter yeni bir adım açar: boş adımda da (numara hiç kalkmaz, numarasız boş satır oluşmaz);
    girintili boş adımda Enter bir dışarı çıkarır. Numaranın önünde ya da hemen arkasında Enter o adımın
    önüne boş bir adım açar. Boş adımda Geri silme adımı siler; dolu adımda numaranın hemen arkasında
    Geri silme numarayı kaldırır (o satıra yeniden yazılınca numara geri gelir).
  - Numara yarım kalmaz: silme / kesme bir numaraya değerse ya da numaralı satır üsttekine birleşirse
    numara bütünüyle kalkar; imleç numaranın içine konamaz (dokununca yazının başına geçer).
  - Boş bir satıra yazılan adım, ilk kelime bitince ya da başka satıra geçince numarasını alır.
    Telefon klavyelerinde de aynı çalışır (Enter / Geri silme tuşunu göndermeyen klavyeler dahil).
  - Tab / Shift+Tab bütün satırı girintiler. Shift+Enter numarasız satır açar. Boş adım şemada boş kutu
    olur ve yazıya yine boş adım olarak döner.
  - Yapıştırılan metne (Python kodu dahil) numara eklenmez. Her değişiklik Ctrl+Z ile geri alınır.
- **C# / Java / C / C++'tan şema:** kod yapıştırınca Türkçe algoritmaya çevrilir (**Koddan çevir** ile önce
  görülebilir); `Main` / `main` ana şema, diğer her metot / fonksiyon parametreli **alt program şeması** olur.
  - Değişken bildirimleri, atama, `++` / `+=`, `if / else if / else`, `switch` (→ Eğer zinciri), `while`,
    `do-while` (→ Tekrarla … olana kadar), `for` (→ İçin, olmuyorsa İken), `foreach` / `for (int x : A)`,
    `break` / `continue` (→ Adım N'e git), `return`, `c ? a : b` (→ Eğer / Değilse)
  - Yazdırma: `Console.WriteLine` (`$"…{x:F2}"`, `{0}` biçimi), `System.out.println / printf`, `printf`,
    `puts`, `cout <<` · Okuma: `Console.ReadLine()` (+ `int.Parse`, `Convert.ToInt32`), `Scanner`
    (`nextInt` …), `scanf`, `cin >>`, `getline`
  - Diziler ve listeler (`new int[n]`, `{1, 2}`, `int A[5]`, `List` / `ArrayList` / `vector`, `Add` /
    `push_back` → `ekle`), `Math.*` / `sqrt` / `pow`, metin metotları (`Length`, `ToUpper`, `Substring`,
    `charAt`, `Contains`, `IndexOf`, `Replace`, `strlen` …), tam sayı bölmesi (`7 / 2` → `7 div 2`)
  - Çevrilemeyen satır yorum (`# …`) olarak kalır ve satır numarasıyla uyarı verilir. Kod çalıştırılmaz
- **Python'dan şema:** kutuya Python kodu yapıştırınca önce Türkçe algoritmaya çevrilir, şema oradan çizilir
  (**Koddan çevir** ile çeviriyi önce görüp düzeltebilirsin). Kod çalıştırılmaz, sadece okunur.
  - `input()` → `Oku` · `print()` → `Yaz` (f-string, `.format()`, `%` dahil) · `if/elif/else` · `while`
  - `for i in range(...)` → `İçin` · `while True` + `break` → `Tekrarla … olana kadar`
  - `break` / `continue` / `return` → `Adım N'e git` · `match/case` → `Eğer` zinciri
  - `0 < x < 10` → `0 < x ve x < 10` · `x in (1, 2)` → `x = 1 veya x = 2` · `a, b = b, a` geçici değişkenle
  - Listeler: `[1, 2]`, `[0] * n`, `a[i]`, `a[-1]`, `a.append(x)`, `a += [x]`, `for x in a` /
    `for i, x in enumerate(a)` (sıra numarasıyla `İçin`), `a[i], a[j] = a[j], a[i]`, `len` `sum` `min` `max`
  - Metinler: `s[1:3]` `s[2:]` `s[::-1]` → `parça` / `ters`, `.upper()` `.lower()` `.strip()` `.replace()`
    `.find()` `.startswith()`, `"a" in s` → `içerir`, `ord` / `chr` → `kod` / `karakter`;
    `input().lower()` küçük harfe çevirerek okunur
  - `def` ile yazılan fonksiyonlar çağrıldıkları yere açılır (`main()` dahil); tek satırlık
    `return ifade` fonksiyonları ifadenin içine yazılır
  - Sözlükler, sınıflar, `x in liste`, liste dilimleri, `list(a)` gibi akış şemasında karşılığı olmayan
    satırlar uyarıyla atlanır ya da şekle olduğu gibi yazılır; uyarılar satır numarasıyla gösterilir
- **Şemadan algoritma:** şema "Adım 1: Başla …" biçiminde numaralı adımlara çevrilir
  (kopyala / .txt indir); bu metin tekrar şemaya çevrilebilir
- **Adım no:** her şeklin sol üst köşesinde adım numarası durur; "Adım N'e git" satırları (geri dönen ya da
  atlayan oklar) okun üstünde kesik çerçeveli numarayla gösterilir. Numaralar "Şemadan algoritma"daki
  adımlarla aynıdır. Numaralı yazılmış bir algoritmadan çizilen şemada yazdığın numaralar korunur (kollar
  yazılış sırasıyla numaralanır). Araç çubuğundaki **Adım no** ile gizlenip gösterilir; açıkken PNG / SVG
  resminde de çıkar.
- **Koda çevir:** şema **C#** (konsol uygulaması), **Java**, **C**, **C++**, **JavaScript**, **Python**
  ya da sözde koda çevrilir. Eğer / İken / İçin yapıları gerçek `if` / `while` / `for` olur; iç içe geçen
  "git"ler varsa durum makinesi yazılır. Değişken türleri (tam sayı, ondalık, metin, doğru/yanlış, dizi)
  kullanımdan çıkarılır; diziler C#'ta `double[]` / `List`, Java'da dizi / `ArrayList`, C++'ta `vector`,
  C'de sabit boyutlu dizi olur. Metin fonksiyonları her dilde aynı sonucu verir (Türkçe büyük/küçük harf,
  UTF-8 harf sayma). Bir dilde karşılığı olmayan adımlar (ör. C'de metin dizisini ters çevirip yazdırmak)
  ve veritabanı gibi açıklama adımları `// TODO` olarak çıkar. Java dosyası `Main.java` adıyla iner.
- **Çalıştır:** şema adım adım yürütülür; sıradaki şekil fosforlu kalemle, geçilen ok yeşil gösterilir,
  değişkenler ve ekran çıktısı izlenir, Giriş şeklinde değer sorulur. Hız seçilebilir,
  sonsuz döngüye karşı adım sınırı vardır. İfadeler güvenli bir ayrıştırıcıyla hesaplanır
  (`+ - * / mod div ^`, `= <> < > <= >=`, `ve veya değil`, `karekök() mutlak() yuvarla() tam() taban() tavan()
  us() rastgele(a, b) metin() sayı()`, dizi ve metin fonksiyonları). Değişken panelinde diziler `[1, 2, 3]`,
  metinler tırnak içinde gösterilir
  - **‹ Geri:** son adımı geri alır; değişkenler, dizi elemanları, ekrana yazılanlar ve izleme tablosu
    o adımdan önceki hâline döner (girişi geri alınca değer yeniden sorulur, başka bir değerle denenebilir)
  - **İçine gir ↓ / Dışarı çık ↑:** Adım alt programı tek adımda çalıştırır; **İçine gir** alt programın
    şemasına geçip adım adım izletir, **Dışarı çık** kalanını çalıştırıp çağırana döner. Panelde çağrı yığını
    (`Ana › Faktoriyel › Faktoriyel`) yazar; izleme tablosunda alt programın kendi değişkenleri
    `Faktoriyel.n` sütununda durur
  - **Kesme noktası:** bir şekli seçip **F9**'a (ya da Kesme noktası düğmesine) basınca şeklin solunda kırmızı
    nokta çıkar; **Oynat** o adıma her gelişte durur, tekrar Oynat ile devam eder. Noktaya tıklayınca kalkar.
    Kesme noktaları bu cihazda şemaya göre hatırlanır (ekip arkadaşlarına gitmez)
  - **İzleme tablosu:** her adımda değişen değişkenler (vurgulu), Karar / Döngü'nün Evet / Hayır sonucu ve
    ekrana yazılanlar satır satır; "Değişmeyen değerleri de yaz" ile her satırda bütün değerler.
    **Kopyala** (Excel / Word'e yapıştırılır) ve **CSV indir** (Türkçe Excel'de doğru açılır). `=`, `+`, `-`, `@`
    ile başlayan metinler dışa aktarılırken formül olarak çalışmasın diye başına `'` eklenir
  - **İzleme tablosu alıştırması** (tablodaki **Alıştırma**): şema görünmeden girdilerle çalıştırılır, adımlar
    sırayla verilir; her satırda değişen değeri, Evet / Hayır'ı ve ekrana yazılanı sen doldurursun,
    **Kontrol et** hücreleri yeşil / kırmızı yapar ve puanı yazar (`2,5` = `2.5`, `E` = `Evet`; değişmeyen
    hücre boş kalabilir). **Cevapları göster** yanlışların doğrusunu yazar
  - **GIF:** çalıştırma hareketli resim olarak iner — her adımda çalışan şekil ve geçilen ok vurgulu, altta
    sıra, değişkenler ve ekran; alt programa girilirse onun şeması görünür (en fazla 150 adım, üç hız)
  - **Testler:** girdiler (her satıra bir değer) ve beklenen çıktı yazılır; **Hepsini çalıştır** her testi şemayı
    baştan çalıştırarak dener, farklı satırları yan yana gösterir ("Girdiler yetmedi", çalışma hatası, sonsuz
    döngü de söylenir). **Son çalıştırmadan test oluştur** elle yapılan çalıştırmanın girdileri ve çıktısıyla
    test yazar. Testler şemayla birlikte saklanır (yedek, ekip, GitHub; şema başına en fazla 30 test).
    Şema değişince eski sonuçlar silinir; Testler düğmesindeki rozet geçen / toplam testi gösterir
- **Ödev çıktısı** (Dosya menüsü): başlık, ad soyad, sınıf / no ile tek sayfa — akış şeması resmi, algoritma
  adımları, seçilen dilde kod, son çalıştırmanın izleme tablosu ve test sonuçları. Tarayıcının yazdır
  penceresinden **PDF olarak kaydet** ile PDF olur; ad ve sınıf bu cihazda hatırlanır
- **? düğmesi:** "Şekiller ne işe yarar?" hatırlatması — her şeklin anlamı, kısa örneği ve
  tek tıkla ekleme (klavyede `?` tuşu da açar)
- Hata kontrolü: Başla yok, kararın iki çıkışı yok, bağlanmamış adım, ulaşılamayan adım…
- **Yerleştir** (şekilleri akışa göre dizer, telefonda ekran genişliğine sığdırır), ekrana sığdır,
  geri al / yinele, PNG / SVG indirme
- Hazır örnekler (gruplu liste): toplam, büyük olanı bul, not harfi, faktöriyel, asal sayı, sayı tahmin
  oyunu, EBOB / EKOK; **diziler:** Fibonacci, en büyük / en küçük, kabarcık sıralama, ikili arama;
  **metinler:** palindrom, sesli harf sayma; bu uygulamanın kendi çalışma akışı ve bir Python kodu
  (not ortalaması)

## Her yerde ara (Ctrl+K)

Kenar çubuğundaki "Her yerde ara" (telefonda üstteki büyüteç), `Ctrl+K` ya da `/` bir arama penceresi
açar: bütün projelerdeki notlar, görevler, şema tabloları ve alanları, akış şemaları ve adımları
birlikte aranır. Ok tuşlarıyla seçip Enter'a basınca ilgili proje ve görünüm açılır, adım ya da
tablo işaretlenir.

### Komut paleti

Aramada `>` ile başlarsan (ya da `Ctrl+Shift+P`) komutlar listelenir; birkaç harf yazıp Enter'a basınca
çalışır: görünüme geç, yeni not / proje, başka projeye geç, tema, yazı boyutu, yüksek karşıtlık, klavye
kısayolları, çöp kutusu, JSON yedeği indir / yükle, .ics yükle, uygulama olarak yükle; Akış'ta çalıştır,
koddan oluştur, koda çevir, testler, izleme tablosu alıştırması, GIF, ödev çıktısı; Şema'da SQL, konsol,
veri sözlüğü; Takvim'de ders programı ve gün görünümü. Telefonda büyüteçle açılan aramaya `>` yazmak yeter.

### Klavye kısayolları penceresi

`Ctrl+/` (Mac'te ⌘/) ya da `?` bütün kısayolları görünüm görünüm listeler (Akış'ta `?` şekillerin
yardımını açar; orada `Ctrl+/` kullan).

## Çöp kutusu

Silinen not, görev, akış şeması ve projeler **30 gün** çöp kutusunda durur. Silince altta çıkan
**Geri al** ile hemen, kenar çubuğundaki **Çöp kutusu**ndan sonra geri alınır; oradan kalıcı silme
ve boşaltma da yapılır.

## Uygulama olarak yükleme

Dışa / İçe aktar → **Telefona / bilgisayara yükle**. Chrome ve Edge doğrudan yükler; iPhone'da
Safari'nin Paylaş → **Ana Ekrana Ekle** adımı gösterilir. Yüklenen uygulama kendi simgesiyle,
tarayıcı çubukları olmadan açılır ve internetsiz çalışır (`sw.js`).

**Paylaş hedefi:** Android'de uygulama yüklüyse başka bir uygulamada (tarayıcı, YouTube, mesajlar…)
Paylaş → **White Note** seçilebilir: başlık, metin ve bağlantı ekleme kutusuna gelir, **Ekle** ile not olur
(kaydetmeden önce görüp düzeltebilirsin).

## Ekip ile çalışma

Projeleri ekip arkadaşlarınla **birlikte** düzenleyebilirsin: biri kart eklediğinde, kartı taşıdığında,
SQL şemasını ya da akış şemasını değiştirdiğinde herkesin ekranında anında görünür. Telefondan ve
bilgisayardan aynı anda kullanılır.

- Üst çubuktaki **Ekip** düğmesi (telefonda kişi simgesi) ya da kenar çubuğundaki **Kişisel** kutusu
  Ekip penceresini açar.
- **Kişisel alan** eskisi gibi sadece bu cihazdadır. **Ekip alanında** projeler ekibin ortak deposunda
  (Google Firebase) durur. İkisi arasında Ekip penceresinden geçilir.
- Kimin çevrimiçi olduğu üst çubukta, hangi projede olduğu kenar çubuğunda görünür. Simgenin
  köşesindeki nokta: yeşil = kaydedildi, sarı = kaydediliyor, gri = çevrimdışı, kırmızı = sorun.
- Açık bir kartı başkası değiştirirse ya da silerse kartta uyarı çıkar; kartta son değiştiren kişi yazar.
  Çöp kutusu ekipte ortaktır ve kimin sildiğini gösterir.
- Telefonda kart sürüklerken gelen değişiklikler kartı bırakana kadar bekletilir.
- İnternet kesilirse çalışmaya devam edersin; değişiklikler bağlantı gelince gönderilir.
- **Kişisel projelerimi bu ekibe kopyala** ile bu cihazdaki projeler ekibe eklenir.
- **Kişi atama:** kart penceresindeki **Atananlar**'dan karta bir ya da birkaç kişi atanır; kartta
  rozetleri görünür, atanan kişiye bildirim gider. Listedeki kişi süzgeci (ya da arama kutusuna `@ben`,
  `@atanmamis`, `@kullanıcıadı`) **bana atananları** gösterir; panoda da çalışır.
- **Yorumlar ve @bahsetme:** kartlara, SQL tablolarına ve akış adımlarına **Yorumlar** düğmesiyle yorum
  yazılır. `@` yazınca üyeler önerilir; bahsedilen kişiye bildirim gider. Yorum sayısı kartta, tablo
  başlığında ve akış adımının köşesinde görünür. Ekip penceresindeki **Senden bahsedenler** hepsini
  listeler. Herkes kendi yorumunu düzenler ya da siler.
- **Not geçmişi:** kart penceresindeki **Geçmiş**, kartın önceki hâllerini gösterir. Bir sürüm seçince
  şu anki hâlle farkı görünür (silinen satırlar kırmızı, eklenenler yeşil); **Bu hâline dön** ile geri
  dönülür. Aynı kişinin 2 dakika içindeki art arda değişiklikleri tek sürüm sayılır. Kendi sunucunda
  geçmiş sunucuda tutulur (kart başına 50 sürüm); kişisel alanda ve Firebase ekibinde bu cihazda (30 sürüm).

Ekip alanı iki yoldan biriyle çalışır:

- **Kendi sunucunda (Raspberry Pi):** Site kendi alan adınla bir Raspberry Pi'den yayınlanıyorsa ekipler o
  sunucuda durur; Google / Firebase hesabı gerekmez. Kurulum: [`sunucu/README.md`](sunucu/README.md).
  Kullanımı aşağıda: [Kendi sunucunda ekip](#kendi-sunucunda-ekip-raspberry-pi).
- **Firebase ile:** Site GitHub Pages'ten açılıyorsa ekip alanı ücretsiz bir Firebase projesi kullanır
  (aşağıdaki kurulum).

### Kendi sunucunda ekip (Raspberry Pi)

Sayfa White Note sunucusundan açıldığında Ekip penceresi kendiliğinden sunucuya bağlanır:

- **Giriş:** kullanıcı adı + şifre. İsteğe bağlı **iki adımlı doğrulama**: Ekip → **Hesap** → **İki adımlı
  doğrulamayı aç** → telefondaki doğrulama uygulamasıyla (Google Authenticator, Microsoft Authenticator,
  Aegis…) QR kodunu okut, çıkan 6 haneli kodu yaz. Bundan sonra girişte bu kod da sorulur.
- **Açık kayıt yok:** ilk kullanıcıyı sunucuyu kuran kişi Pi'de oluşturur. Diğerleri ekipten aldıkları
  **davet koduyla** hesap açar. Hesabı olan biri davet koduyla başka ekiplere de katılabilir.
- **Davet:** ekibin sahibi ya da yöneticisi Ekip penceresinde rolü (yönetici / üye / okur), geçerlilik süresini
  (1 / 7 / 30 gün) ve kaç kişinin kullanabileceğini seçip **Davet oluştur**'a basar. Çıkan bağlantıyı
  (`…#katil=KOD`) ya da kodu paylaşır. Kod yalnız bir kez gösterilir; açık davetler listelenir ve
  **İptal et** ile geçersiz kılınabilir.
- **Roller:**

  | Rol | Görür | Düzenler | Davet eder | Üye çıkarır | Rol / ekip adı değiştirir |
  | --- | --- | --- | --- | --- | --- |
  | Ekip sahibi | ✓ | ✓ | ✓ | ✓ | ✓ |
  | Yönetici | ✓ | ✓ | ✓ (üye, okur) | üye ve okurları | – |
  | Üye | ✓ | ✓ | – | – | – |
  | Okur | ✓ | – | – | – | – |

  Okur bir şeyi değiştirmeye çalışırsa kaydedilmez, ekran ekibin hâline döner.
- **Canlı:** değişiklikler ve kimin çevrimiçi olduğu sunucudan anında gelir (Firebase'deki gibi).
- **Etkinlik geçmişi:** Ekip penceresindeki **Etkinlik geçmişi** kimin neyi ne zaman eklediğini,
  değiştirdiğini ya da sildiğini gösterir (son 180 gün). Aynı kişinin aynı karttaki 10 dakika içindeki
  değişiklikleri tek satırdır. Satıra basınca o kart, tablo ya da akış adımı açılır.
- **Sunucuya ulaşılamazsa** (internet ya da Pi kapalı): ekip bu cihazda daha önce açıldıysa cihazdaki
  kopyasıyla açılır; değişiklikler sırada bekler ve bağlantı gelince gönderilir. Durum satırı
  "Sunucuya ulaşılamıyor" der.
- **Hesap:** görünen adını ve şifreni Ekip → **Hesap**'tan değiştirirsin. Şifre değişince diğer
  cihazlardaki oturumların kapanır (oradaki gönderilmemiş değişiklikler, aynı hesapla yeniden girince
  gönderilir). Şifreni unutursan sunucuyu kuran kişi Pi'de `sifre-sifirla` komutuyla yenisini verir.
- **Çıkış yap**, bu cihazdaki ekip kopyalarını da siler. Ekipten çıkarılan ya da ayrılan kişinin
  cihazındaki o ekibin kopyası silinir ve açık sayfası hemen kişisel alana döner.
- Diğer üyeler senin görünen adını ve kullanıcı adını görür; e-posta istenmez.

### Bir kez kurulum (Firebase ile, ekibi kuran kişi, yaklaşık 10 dakika)

Ekip alanı ücretsiz bir Firebase projesi kullanır (Spark planı yeter, kart bilgisi istemez).
Aynı adımlar uygulamadaki Ekip penceresinde de yazar.

1. https://console.firebase.google.com adresinde **Proje oluştur** (Create a project).
   Google Analytics'i kapatabilirsin.
2. **Authentication → Başlayın (Get started) → Sign-in method**: **Google**'ı aç (destek e-postası
   olarak kendi adresini seç), sonra **E-posta/Şifre**'yi (Email/Password) aç.
3. **Authentication → Settings → Authorized domains → Add domain**: `acemividyolar-alt.github.io`
4. **Firestore Database → Create database**: sürüm sorarsa **Standard**, konum olarak Avrupa'dan birini
   (ör. `europe-west1`) seç, **production mode** ile başlat.
5. Firestore'un **Rules** (Kurallar) sekmesine bu depodaki [`firestore.rules`](firestore.rules)
   dosyasının içeriğini yapıştır ve **Publish**'e bas.
6. **Proje ayarları** (dişli) → **General** → **Your apps** → web simgesi `</>` → bir ad yaz →
   **Register app**. Çıkan `firebaseConfig` kutusunu kopyala.
7. White Note'ta **Ekip** → kutuya yapıştır → **Kaydet ve devam et** → Google ile ya da e-postayla
   giriş yap → ekip adını yazıp **Kur**.

Menüde bir bölümü bulamazsan konsolun üstündeki arama kutusuna adını yaz (ör. "Firestore").

### Ekip arkadaşlarını davet etme

Ekip penceresindeki **davet bağlantısını** paylaş (telefonda **Paylaş** düğmesi WhatsApp gibi
uygulamaları açar). Bağlantıyı açan kişi Google hesabıyla ya da e-postayla giriş yapıp **Ekibe katıl**'a
basar; onun Firebase kurulumu yapması gerekmez. Bağlantıyı açan herkes katılabildiği için sadece ekip
arkadaşlarınla paylaş. Ekip sahibi **Yeni bağlantı oluştur** ile eski bağlantıyı geçersiz kılabilir ve
üyeleri **Çıkar**abilir; bir üye çıkarılınca davet bağlantısı da kendiliğinden yenilenir.

iPhone'da ana ekrana eklenen uygulama, Safari'de açılan bağlantıyı göremez. O zaman bağlantıyı kopyala,
uygulamada Ekip penceresindeki **Davet bağlantısını buraya yapıştır** kutusuna yapıştır.

### Bilinmesi gerekenler

- Ekipteki herkes ekibin bütün projelerini görür ve düzenler; üyeler birbirinin adını ve e-postasını görür.
- Aynı kartı iki kişi aynı anda kaydederse son kaydeden geçerli olur (kart penceresi bunu haber verir).
- Bir kayıt en fazla yaklaşık 1 MB olabilir; çok büyük kapak resmi eklenemez.
- Firebase'in ücretsiz planı küçük bir ekip için fazlasıyla yeter (günde 50.000 okuma, 20.000 yazma).
- Kimin neyi okuyup yazabileceğini `firestore.rules` belirler: sadece ekip üyeleri okur ve yazar,
  ekibe sadece geçerli davet koduyla katılınır.

## GitHub ile paylaşma (Firebase'siz)

Firebase kurmak istemeyen ekipler projeleri GitHub'daki **gizli bir depoda** paylaşabilir. Her proje
depoda `projeler/<proje-kimliği>.json` dosyası olarak durur ve her kayıt bir sürüm (commit) olur, yani eski
hallere GitHub'dan dönülebilir. Bu dosya normal bir JSON yedeğidir; **JSON yedeği yükle** ile de açılır.

Üst çubukta **Ekip**'in yanındaki **GitHub** düğmesi GitHub penceresini açar (bağlı değilken kurulumu,
bağlıyken açık projeyi kaydetme / getirme ve depodaki projeleri). Bağlandıktan sonra düğmedeki nokta açık
projenin durumunu gösterir:

- yeşil: GitHub'daki hal ile aynı
- sarı: kaydedilmemiş değişikliğin var
- mavi: GitHub'da daha yeni bir hal var
- kırmızı: hem sende hem GitHub'da değişiklik var

### Bir kez kurulum (ekibi kuran kişi, yaklaşık 5 dakika)

1. https://github.com/new adresinde bir depo aç (ör. `white-note-veri`). **Private**'ı seç ve
   **Add a README file**'ı aç.
2. https://github.com/settings/personal-access-tokens/new adresinde bir anahtar (fine-grained token) oluştur:
   - **Repository access**: **Only select repositories** → bu depo
   - **Permissions**: **Contents** → **Read and write**. Başka izin gerekmez.
   - **Expiration**: projenin bitişinden sonraki bir tarih
   
   Çıkan `github_pat_…` anahtarını kopyala. Klasik anahtar (`ghp_…`) kabul edilmez: klasik anahtar
   sahibinin bütün depolarına erişir ve bağlantıyla dağıtılınca hepsi açığa çıkar.
3. White Note'ta üst çubuktaki **GitHub** düğmesine bas. Depo adını, anahtarı ve adını yaz, **Bağlan**'a bas.
4. Açık projeyi **GitHub'a kaydet** ile ilk kez depoya yaz.

### Ekip arkadaşlarını ekleme

GitHub penceresindeki **Kopyala** ile bağlantıyı al ve ekip arkadaşlarına gönder. Bağlantıyı açan kişi
adını yazıp **Bağlan**'a basar; GitHub hesabı gerekmez. Sonra listede projenin yanındaki **Getir**'e basar.

Bağlantıda deponun anahtarı vardır: bağlantıyı alan herkes projeleri görür ve değiştirir. Bu yüzden sadece
ekip arkadaşlarınla paylaş. Bağlantı başkasının eline geçerse anahtarı GitHub'da sil
(Settings → Developer settings → Personal access tokens), yenisini oluştur ve bağlantıyı yeniden gönder.

Başka bir depoya bağlıyken yeni bir GitHub bağlantısı açarsan pencere bunu açıkça yazar: bağlanırsan
kayıtların artık o depoya gider. Bağlantıyı tanımadığın birinden aldıysan **Vazgeç**'e bas.

### Nasıl çalışır

- **GitHub'a kaydet** açık projeyi depoya yazar. Commit mesajında kimin kaydettiği yazar
  (ör. "VetTakip · Ayşe kaydetti").
- **Getir** depodaki hali bu cihaza alır. Proje kopyalanmaz, aynı proje güncellenir.
- **Kendiliğinden kaydetme** (GitHub penceresinde, varsayılan olarak açık): GitHub'a bir kez kaydedilmiş
  ya da oradan getirilmiş projede değişiklik yapınca, birkaç saniye yeni değişiklik gelmezse proje
  kendiliğinden kaydedilir (art arda değişiklikler tek kayıtta gider; sekmeden çıkarken bekleyen kayıt
  hemen yapılır). Bu arada başkası kaydetmişse üzerine **yazılmaz**: o projede kendiliğinden kaydetme durur
  ve hangisinin kalacağı sorulur. Hiç kaydedilmemiş proje kendiliğinden gönderilmez. İnternet ya da GitHub
  geçici olarak cevap vermezse sonra yeniden denenir. Ayar sadece o cihazda geçerlidir.
- Sayfa açılınca, sekmeye dönünce ve dakikada bir depo kontrol edilir. Açık projede kaydedilmemiş
  değişikliğin yoksa yeni hal kendiliğinden gelir; varsa sadece haber verilir.
- Sen getirdikten sonra başka biri kaydettiyse kaydın yapılmaz. Bunun yerine hangisinin kalacağı sorulur:
  onun hali (istersen önce seninkinin yedeği iner) ya da seninki (onunki GitHub geçmişinde kalır).
  Kimsenin işi habersizce ezilmez.
- Depodan gelen dosya, yedek yüklemedeki gibi denetlenir: bozuk ya da güvensiz dosya "okunamadı" diye
  gösterilir ve uygulanmaz; başka bir projendeki kayıtların üstüne yazılmaz.
- Depo adı, anahtar ve adın sadece o tarayıcıda saklanır; anahtar sadece `api.github.com`'a gönderilir.

## Veriler nerede?

- **Kişisel alanda** her şey bu cihazın tarayıcısında (`localStorage`) saklanır; hiçbir sunucuya
  gönderilmez. **Ekip alanında** projeler ekibin sunucusunda (kendi Raspberry Pi'n) ya da Firebase
  projesinde durur (bkz. Ekip ile çalışma). Sunucuda ekibin, çevrimdışı açılabilsin diye bir kopyası da
  cihazda (IndexedDB) tutulur; çıkış yapınca silinir.
  **GitHub'a kaydet** dediğin projelerin bir kopyası da ekibin GitHub deposuna gider
  (bkz. GitHub ile paylaşma).
- Tarayıcılar bu alana sınır koyar (çoğunda yaklaşık 5 MB). Kapak resimleri bu yüzden
  otomatik küçültülür; kullanılan alan liste görünümünün altında görünür.
- Sayfa yeniden açılınca **en son çalıştığın proje** açılır (kişisel alan ve her ekip ayrı hatırlanır).
- Uygulama aynı bilgisayarda **iki sekmede** (ya da sekme + yüklü uygulama) açıksa, birinde yapılan
  değişiklik birkaç saniye içinde öbürüne de gelir. O sırada öbür sekmede bir pencere açıksa ya da
  bir şey düzenleniyorsa, iş bitince getirilir.
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
  SIL Open Font License), `firestore.rules` (ekip alanının Firestore güvenlik kuralları).
  Sadece `index.html` indirilse de çalışır; o zaman sistem yazı tipi kullanılır.
- Ekip alanı Firebase kütüphanesini ilk kullanımda internetten bir kez yükler; ekip alanı sadece sitenin
  internetteki adresinden açıldığında çalışır (dosyadan açılan sayfada değil).
- `script.js` ve `style.css` eski bir sürümden kalmadır ve kullanılmaz.

## Kısayollar

| Kısayol | Nerede | İş |
| --- | --- | --- |
| Ctrl+K (Mac'te ⌘K) ya da / | Her yerde | Tüm projelerde ara |
| Ctrl+Shift+P ya da aramada `>` | Her yerde | Komut paleti |
| Ctrl+/ ya da ? | Her yerde (Akış'ta yalnız Ctrl+/) | Klavye kısayolları penceresi |
| 1 – 5 | Her yerde (yazmıyorken) | Liste / Pano / Şema / Akış / Takvim |
| N | Her yerde (yazmıyorken) | Yeni not ya da görev (ekleme kutusuna geçer) |
| Ctrl+Enter | Ekleme kutusu | Not/görev ekle |
| `[[` | Kart açıklaması | Not başlığı öner (Enter / Tab ile seç) |
| Esc | Liste (Seç açıkken) | Toplu seçimi bitir |
| Ctrl+Enter | SQL konsolu | Çalıştır (seçili kısım varsa sadece o) |
| Ctrl+Z / Ctrl+Y | Şema, Akış | Geri al / yinele |
| Delete | Şema | Seçili ilişkiyi sil |
| Delete | Akış | Seçili şekli / oku sil |
| F9 | Akış | Seçili şekle kesme noktası koy / kaldır |
| Shift + tıkla / sürükle | Akış | Çoklu seçim |
| Ctrl + C / X / V / D | Akış | Seçili şekilleri kopyala / kes / yapıştır / çoğalt |
| Ctrl + A | Akış | Bütün şekilleri seç |
| Enter / çift tık | Akış | Seçili şekli düzenle |
| Ctrl+Enter | Algoritma kutusu | Akış şemasını oluştur |
| Enter / Shift+Enter | Algoritma kutusu | Sıradaki "Adım N:" ile yeni satır / numarasız yeni satır |
| Tab / Shift+Tab | Algoritma kutusu | Satırı girintile / geri al |
| ? | Akış | Şekiller ne işe yarar? (yardım) |
| Ctrl + tekerlek | Şema, Akış | Yakınlaştır / uzaklaştır |
| Esc | Her yerde | Açık pencereyi kapat |
