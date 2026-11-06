# White Note sunucusu (Raspberry Pi)

Uygulamayı kendi alan adınla (ör. `https://whitenote.com.tr`) evdeki bir Raspberry Pi'den yayınlar ve
**ekip alanını** Firebase yerine bu sunucuda tutar:

- kullanıcı adı + şifre ile giriş (isteğe bağlı iki adımlı doğrulama)
- ekipler, davet kodları, roller (sahip / yönetici / üye / okur)
- anında eşitleme

Tek dosyadır, dış paket gerekmez (Node.js 22.13 ya da üstü yeter). Veriler Pi'deki bir SQLite dosyasında
durur ve her gece yedeklenir. Uygulamanın ekipte nasıl kullanıldığı ana
[README](../README.md#kendi-sunucunda-ekip-raspberry-pi)'de anlatılıyor.

İnternete açmak için **Cloudflare Tunnel** kullanılır:

- Modemde port açmak gerekmez.
- İnternet sağlayıcın CGNAT kullanıyor olsa da çalışır.
- HTTPS sertifikasını Cloudflare verir.

```
Tarayıcı ──HTTPS──> Cloudflare ──tünel──> cloudflared (Pi) ──> 127.0.0.1:8080 White Note sunucusu ──> SQLite
```

## 1. Pi'yi hazırla (bir kez)

1. **Raspberry Pi OS Lite (64-bit)** kur. Raspberry Pi Imager'ın ayarlarında kullanıcı adını, SSH anahtarını
   ve Wi-Fi'yi gir. Mümkünse kablolu ağ kullan; SD kart yerine USB 3 SSD daha dayanıklıdır.
2. Güncelle ve otomatik güvenlik güncellemelerini aç:
   ```bash
   sudo apt update && sudo apt full-upgrade -y
   sudo apt install -y git unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```
3. **Node.js 22 LTS** (ya da 24):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt install -y nodejs
   node --version     # v22.13 ya da üstü olmalı (Raspberry Pi OS'un kendi paketi eskidir, bu yüzden NodeSource)
   ```
4. Sunucu için ayrı, oturum açamayan bir kullanıcı ve uygulamanın kopyası:
   ```bash
   sudo useradd --system --home /opt/whitenote --shell /usr/sbin/nologin whitenote
   sudo mkdir -p /opt/whitenote && sudo chown whitenote: /opt/whitenote
   sudo -u whitenote git clone https://github.com/acemividyolar-alt/white_not.git /opt/whitenote/white_not
   ```

## 2. Sunucuyu çalıştır

```bash
cd /opt/whitenote/white_not/sunucu
sudo cp whitenote.service /etc/systemd/system/
sudo nano /etc/systemd/system/whitenote.service     # WN_ADRES satırına kendi alan adını yaz
sudo systemctl daemon-reload
sudo systemctl enable --now whitenote
systemctl status whitenote                           # "active (running)" görmelisin
```

İlk kullanıcıyı (seni) yönetici olarak ekle. Şifre sorulur, en az 10 karakter olmalı:

```bash
sudo -u whitenote env WN_VERI=/var/lib/whitenote node /opt/whitenote/white_not/sunucu/whitenote-sunucu.js kullanici-ekle senin-adin --yonetici
```

Pi'nin kendisinde dene:

```bash
curl -s http://127.0.0.1:8080/api/durum
```

`{"whitenote":true,…}` cevabı sunucunun çalıştığını gösterir.

## 3. Alan adı ve Cloudflare Tunnel

1. Alan adını Cloudflare'e ekle (ücretsiz plan).
2. Kayıt firmasının (ör. Turhost) panelinde **nameserver**'ları Cloudflare'in verdiği iki adresle değiştir.
   `.tr` alan adlarında bu değişiklik günde birkaç kez işlenir. Cloudflare'de alan adı **Active** görünene
   kadar bekle.
3. Pi'ye `cloudflared` kur:
   ```bash
   curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
   echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
   sudo apt update && sudo apt install -y cloudflared
   ```
4. Tüneli oluştur ve alan adını bağla:
   ```bash
   cloudflared tunnel login                         # tarayıcıda alan adını seç
   cloudflared tunnel create whitenote
   cloudflared tunnel route dns whitenote whitenote.com.tr
   ```
5. `~/.cloudflared/config.yml` dosyasını oluştur. `UUID` yerine `tunnel create` komutunun yazdığı kimliği yaz:
   ```yaml
   tunnel: whitenote
   credentials-file: /home/KULLANICI/.cloudflared/UUID.json
   ingress:
     - hostname: whitenote.com.tr
       service: http://127.0.0.1:8080
     - service: http_status:404
   ```
6. Tüneli servis olarak başlat:
   ```bash
   sudo cloudflared --config ~/.cloudflared/config.yml service install
   ```
7. Cloudflare panelinde **SSL/TLS → Edge Certificates → Always Use HTTPS** açık olsun.

Artık `https://whitenote.com.tr` açılır. Ayrıntılar:
[Cloudflare belgesi](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/local-management/create-local-tunnel).

## 4. İlk ekip

1. `https://whitenote.com.tr` adresini aç ve **Ekip**'e bas.
2. 2. adımda oluşturduğun kullanıcı adı ve şifreyle giriş yap.
3. **Yeni ekip kur**'a ekibin adını yaz.
4. Ekip açılınca **Ekip** penceresinde rolü, süreyi ve kişi sayısını seçip **Davet oluştur**'a bas.
   Bağlantıyı ekip arkadaşlarına gönder: bağlantıyı açan kişi kendi hesabını açar ve ekibe katılır.
5. İstersen **Hesap → İki adımlı doğrulamayı aç** ile hesabını telefonuna bağla.

## Komutlar

```bash
sudo -u whitenote env WN_VERI=/var/lib/whitenote node /opt/whitenote/white_not/sunucu/whitenote-sunucu.js KOMUT
```

| Komut | İş |
| --- | --- |
| `kullanici-ekle AD [--yonetici]` | Yeni kullanıcı ekler (şifre sorulur). Normalde kullanıcılar davet koduyla kendileri hesap açar |
| `sifre-sifirla AD` | Şifreyi değiştirir, o kişinin açık oturumlarını kapatır |
| `totp-kapat AD` | İki adımlı doğrulamayı kapatır (telefon kaybolursa) |
| `kullanici-kapat AD` | Hesabı kapatır: giriş yapamaz, açık oturumları hemen kapanır |
| `kullanici-ac AD` | Kapatılan hesabı yeniden açar |
| `kullanicilar` | Kullanıcıları listeler (yönetici, iki adımlı, kapalı) |
| `yedek-al` | Hemen yedek alır |
| `geri-yukle DOSYA` | Yedeği geri yükler; önce sunucuyu durdur (aşağıda) |

## Ayarlar

`whitenote.service` dosyasındaki `Environment=` satırları:

| Ayar | Varsayılan | Ne işe yarar |
| --- | --- | --- |
| `WN_ADRES` | (boş) | Sitenin adresi, ör. `https://whitenote.com.tr`. Değiştiren isteklerde aynı site denetimi ve güvenli çerez için gerekli |
| `WN_PORT` / `WN_HOST` | `8080` / `127.0.0.1` | Dinlenen adres. Tünel aynı cihazdan bağlandığı için dışarı açmaya gerek yok |
| `WN_VERI` | `/var/lib/whitenote` | Veritabanı ve yedekler (uygulama klasörünün dışında olmalı) |
| `WN_VEKIL` | `cloudflare` | Gerçek ziyaretçi adresi Cloudflare'in başlığından alınır (deneme sınırları için) |
| `WN_KOTA_MB` / `WN_KOTA_ADET` | `300` / `100000` | Bir ekibin kayıtları için depolama sınırı |
| `WN_GECMIS_MB` | `150` | Bir ekibin eski sürümleri (not geçmişi) için en fazla yer; aşılınca en eskiler silinir |

## Güncelleme

```bash
sudo -u whitenote git -C /opt/whitenote/white_not pull
sudo systemctl restart whitenote
```

## Yedekler

Her gece 03:30'da `/var/lib/whitenote/yedek/whitenote-YYYY-MM-DD.db` dosyasına yedek alınır ve son 14 gün
tutulur. Pi'nin kartı bozulursa diye haftada bir başka bir diske ya da bilgisayara kopyala:

```bash
rsync -a /var/lib/whitenote/yedek/ /media/usb/whitenote-yedek/
```

Geri yüklemek için:

```bash
sudo systemctl stop whitenote
sudo -u whitenote env WN_VERI=/var/lib/whitenote node /opt/whitenote/white_not/sunucu/whitenote-sunucu.js geri-yukle /var/lib/whitenote/yedek/whitenote-2026-11-05.db
sudo systemctl start whitenote
```

Etkinlik geçmişi ve kartların eski sürümleri 180 gün tutulur; gece yedeğiyle birlikte temizlenir.

Geri yüklemeden sonra herkesin uygulaması ekibin verilerini baştan alır. Yedekten sonra yapılan
değişiklikler kaybolur; cihazlarda gönderilmeyi bekleyen değişiklikler ise gönderilir.

## Güvenlik

**Bağlantı**
- Sunucu yalnız `127.0.0.1`'i dinler; dışarıdan yalnız tünelden ulaşılır. Modemde port açma.
- Değiştiren her istekte uygulamanın özel başlığı ve aynı site kökeni aranır (CSRF).

**Giriş ve oturum**
- Şifreler scrypt ile saklanır.
- Oturum çerezi `HttpOnly`, `Secure` ve `SameSite=Strict`'tir; JavaScript göremez.
- Şifre değişince, çıkış yapınca ya da biri ekipten çıkarılınca o kişinin açık canlı bağlantısı hemen kesilir.
- Art arda yanlış şifre ya da kod girilirse 15 dakika beklenir. İki adımlı doğrulamada aynı kod iki kez
  kullanılamaz.

**Hesap ve ekip**
- Açık kayıt yok: yeni kişi ancak ekibin sahibinin ya da yöneticisinin verdiği davet koduyla katılır.
  Kodun kendisi saklanmaz, yalnız özeti tutulur; açık davetler iptal edilebilir.
- Okur rolündeki kişinin yazma istekleri sunucuda reddedilir.
- Her ekibin bir depolama sınırı vardır; bir hesap ele geçse bile diski dolduramaz.

**Sayfa ve veri**
- Sayfa sıkı bir İçerik Güvenlik Politikası (CSP) ile sunulur: yalnız uygulamanın kendi betikleri çalışır.
  Firebase adreslerine izin verilmez (ekip bu sunucuda).
- `sunucu/` klasörü, gizli dosyalar ve veritabanı internete sunulmaz.
- Veri klasörü yalnız `whitenote` kullanıcısına açıktır; servis sistemin geri kalanını salt okunur görür.
- Uygulama, ekip sunucuya ulaşılamazken de açılabilsin diye cihazda bir kopya tutar (IndexedDB). Bu kopya
  çıkış yapınca, ekipten ayrılınca ya da çıkarılınca silinir.

**Pi**
- Pi'ye SSH ile yalnız anahtarla gir (`PasswordAuthentication no`).
