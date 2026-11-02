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
- Karta tıklayınca düzenleme penceresi (açıklama, etiket, tür, sütun, son tarih, tekrar, kapak resmi)
- **Tekrarlayan görev:** kart penceresinde *Her gün / Hafta içi her gün / Her hafta / Her ay / Her yıl*.
  Görev tamamlanınca bir sonraki tarihe yenisi açılır (tamamlanan geçmiş olarak kalır, panoda "Bitti"de durur);
  yenisinde kontrol listesi maddeleri işaretsiz başlar. Alttaki bildirimden **Geri al** ile vazgeçilir.
  Aylık tekrarda gün ayın sonuna sığdırılır ama unutulmaz (31 Ocak → 28 Şubat → 31 Mart).

### Takvim
- Son tarihi olan not ve görevler **aylık** ya da **haftalık** takvimde (Ay / Hafta); güne tıklayınca o günün listesi
- O güne doğrudan görev ekleme, görevi oradan tamamlama, "Tüm projeler" seçeneği
- Tekrarlayan görevlerin ileriki günleri takvimde soluk ve kesik çizgili görünür
- **Hatırlat:** açınca (tarayıcı bildirim izni ister) bugün, yarın ve gecikmiş görevler için bildirim gelir:
  sayfa açılınca, sekmeye dönünce ve açıkken 5 dakikada bir bakılır; aynı görev için günde bir kez.
  Sunucu olmadığı için tarayıcı tamamen kapalıyken bildirim gelmez.
- **Takvim dosyası (.ics):** *Dışa / İçe aktar → Takvim dosyası* son tarihli not ve görevleri Google Takvim,
  Outlook ya da telefonun takvimine aktarılabilen dosyaya yazar (tekrarlayanlar tekrar kuralıyla).
  Google Takvim'de: Ayarlar → İçe ve dışa aktar → İçe aktar.

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
  - **Örnek veri ekle:** her tabloya 10 satır anlamlı Türkçe deneme verisi (ad, soyad, telefon,
    e-posta, il/ilçe, tarih, fiyat, geçerli TC kimlik numarası…). Sütun adına, türüne ve CHECK
    kısıtlarına göre üretilir; yabancı anahtarlar gerçek satırlara bağlanır, UNIQUE alanlar tekrar etmez.
    **Verileri şemaya kaydet** ile konsolda eklenen satırlar şemanın "Ek SQL" kısmına `INSERT` olarak
    yazılır (önce denenir; böylece `.db` indirince ve "SQLite'ta dene"de de gelir)
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
- **Python'dan şema:** kutuya Python kodu yapıştırınca önce Türkçe algoritmaya çevrilir, şema oradan çizilir
  (**Python'dan çevir** ile çeviriyi önce görüp düzeltebilirsin). Kod çalıştırılmaz, sadece okunur.
  - `input()` → `Oku` · `print()` → `Yaz` (f-string, `.format()`, `%` dahil) · `if/elif/else` · `while`
  - `for i in range(...)` → `İçin` · `while True` + `break` → `Tekrarla … olana kadar`
  - `break` / `continue` / `return` → `Adım N'e git` · `match/case` → `Eğer` zinciri
  - `0 < x < 10` → `0 < x ve x < 10` · `x in (1, 2)` → `x = 1 veya x = 2` · `a, b = b, a` geçici değişkenle
  - `def` ile yazılan fonksiyonlar çağrıldıkları yere açılır (`main()` dahil); tek satırlık
    `return ifade` fonksiyonları ifadenin içine yazılır
  - Listeler, sözlükler, sınıflar gibi akış şemasında karşılığı olmayan satırlar uyarıyla atlanır
    ya da şekle olduğu gibi yazılır; uyarılar satır numarasıyla gösterilir
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
- **Yerleştir** (şekilleri akışa göre dizer, telefonda ekran genişliğine sığdırır), ekrana sığdır,
  geri al / yinele, PNG / SVG indirme
- Hazır örnekler: toplam, büyük olanı bul, not harfi, faktöriyel, asal sayı, sayı tahmin oyunu,
  bu uygulamanın kendi çalışma akışı ve bir Python kodu (not ortalaması)

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

### Bir kez kurulum (ekibi kuran kişi, yaklaşık 10 dakika)

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
  gönderilmez. **Ekip alanında** projeler ekibin Firebase projesinde durur (bkz. Ekip ile çalışma).
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
| 1 – 5 | Her yerde (yazmıyorken) | Liste / Pano / Şema / Akış / Takvim |
| N | Her yerde (yazmıyorken) | Yeni not ya da görev (ekleme kutusuna geçer) |
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
