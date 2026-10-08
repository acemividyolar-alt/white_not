# White Note

Not, görev, Trello tarzı pano ve **SQLite veritabanı şema tasarımcısı** bir arada.
Tek bir `index.html` dosyasından oluşur; kurulum gerektirmez, tarayıcıda çalışır.

**Canlı sürüm:** https://acemividyolar-alt.github.io/white_not/

## Görünümler

### Liste
- Not ve görev ekleme, etiketler (`virgülle`), sabitleme, arama (`#etiket` ile de)
- Görev ilerleme çubuğu
- Karta tıklayınca düzenleme penceresi (açıklama, etiket, tür, sütun, kapak resmi)

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

## Veriler nerede?

- Her şey bu cihazın tarayıcısında (`localStorage`) saklanır; hiçbir sunucuya gönderilmez.
- Tarayıcılar bu alana sınır koyar (çoğunda yaklaşık 5 MB). Kapak resimleri bu yüzden
  otomatik küçültülür; kullanılan alan liste görünümünün altında görünür.
- Başka cihaza taşımak ya da yedeklemek için: **Dışa / İçe aktar → JSON yedeği indir / yükle**.
- Notlar ayrıca Markdown, düz metin ve PDF olarak dışa aktarılabilir (şema SQL'i dahil).

## Notlar

- SQLite motoru (konsol, "SQLite'ta dene", `.db` indirme ve içe aktarma) ilk kullanımda
  internetten bir kez yüklenir (~650 KB). Diyagram ve SQL üretimi internetsiz çalışır.
- Uygulamanın tamamı `index.html` içindedir. `script.js` ve `style.css` eski bir
  sürümden kalmadır ve kullanılmaz.

## Kısayollar

| Kısayol | Nerede | İş |
| --- | --- | --- |
| Ctrl+Enter | Ekleme kutusu | Not/görev ekle |
| Ctrl+Enter | SQL konsolu | Çalıştır (seçili kısım varsa sadece o) |
| Ctrl+Z / Ctrl+Y | Şema | Geri al / yinele |
| Delete | Şema | Seçili ilişkiyi sil |
| Ctrl + tekerlek | Şema | Yakınlaştır / uzaklaştır |
| Esc | Her yerde | Açık pencereyi kapat |
