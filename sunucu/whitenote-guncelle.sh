#!/bin/bash
# =====================================================================
# White Note — kendiliğinden güncelleme (Raspberry Pi)
# whitenote-guncelle.timer birkaç dakikada bir çalıştırır. GitHub'daki main dalında yeni bir sürüm varsa:
#   indirir → denetler (arşivin yapısı, gerekli dosyalar, sunucu kodunun söz dizimi) → kurar → hizmeti yeniden
#   başlatır → sunucu 30 saniyede cevap vermezse eski sürüme geri döner (o sürüm bir daha denenmez; daha yenisi beklenir).
# Yalnız uygulama dosyaları değişir (index.html, sunucu kodu, simgeler …). Veriler (/var/lib/whitenote),
# hizmet ayarları ve bu betiğin kurulu kopyası değişmez; GitHub'dan inen hiçbir şey yönetici olarak çalıştırılmaz.
# Açık sayfalar sunucudaki yeni sürümü görünce uygun anda kendiliğinden yenilenir (index.html: wnSurumBak).
#
# Kayıtlar:  journalctl -u whitenote-guncelle
# Durum:     /var/lib/whitenote-guncelle/durum.json  (ayrıca http://PI-ADRESI:8080/api/durum → "guncelleme")
# Hemen dene: sudo systemctl start whitenote-guncelle
# Durdur:     sudo systemctl disable --now whitenote-guncelle.timer
# =====================================================================
set -uo pipefail
DEPO="${WN_GUNCELLE_DEPO:-acemividyolar-alt/white_not}"
DAL="${WN_GUNCELLE_DAL:-main}"
API="${WN_GUNCELLE_API:-https://api.github.com}"
ARSIV="${WN_GUNCELLE_ARSIV:-https://codeload.github.com}"
UYG="${WN_UYGULAMA:-/opt/whitenote/white_not}"
PORT="${WN_PORT:-8080}"
D="${WN_GUNCELLE_DIR:-/var/lib/whitenote-guncelle}"
umask 022
mkdir -p "$D" && chmod 755 "$D"

exec 9>"$D/kilit"
flock -n 9 || { echo "Başka bir güncelleme sürüyor."; exit 0; }
G=$(mktemp -d /tmp/wn-guncelle.XXXXXX) || exit 1
trap 'rm -rf "$G"' EXIT
chmod 711 "$G"

kurulu=$(cat "$D/kurulu" 2>/dev/null || true)
basarisiz=$(cat "$D/basarisiz" 2>/dev/null || true)
simdi() { date +%s; }
durum() {   # durum.json: sunucu /api/durum'da gösterir
  local d="$1" m="${2:-}" k
  k=$(cat "$D/kurulu" 2>/dev/null || true)
  m=$(printf '%s' "$m" | tr -d '"\\' | tr '\n\r\t' '   ' | cut -c1-200)
  printf '{"durum":"%s","surum":"%s","zaman":%s,"denetim":%s,"mesaj":"%s"}\n' \
    "$d" "$k" "$(cat "$D/zaman" 2>/dev/null || echo 0)" "$(simdi)" "$m" > "$D/durum.json.yeni" &&
    mv -f "$D/durum.json.yeni" "$D/durum.json"
}

# 1) GitHub'daki son sürüm. Değişmediyse GitHub 304 döner (istek sınırına sayılmaz).
etag=$(cat "$D/etag" 2>/dev/null || true)
arg=(-sS --max-time 25 -o "$G/sha" -D "$G/baslik" -w '%{http_code}' -H 'Accept: application/vnd.github.sha' -H 'User-Agent: whitenote-guncelle')
[ -n "$etag" ] && [ -n "$kurulu$basarisiz" ] && arg+=(-H "If-None-Match: $etag")
kod=$(curl "${arg[@]}" "$API/repos/$DEPO/commits/$DAL" 2>"$G/hata") || kod=000
case "$kod" in
  304) if [ -n "$basarisiz" ]; then durum basarisiz "${basarisiz:0:7} kurulamadı; ${kurulu:0:7} ile devam ediliyor, yenisi bekleniyor."
       else durum tamam; fi; exit 0 ;;
  200) ;;
  000) echo "GitHub'a ulaşılamadı: $(head -c 200 "$G/hata")"; durum ulasilamadi "GitHub'a ulaşılamadı (Pi internete bağlı mı?)"; exit 0 ;;
  *)   echo "GitHub beklenmeyen cevap verdi: $kod"; durum ulasilamadi "GitHub cevabı: $kod"; exit 0 ;;
esac
sha=$(tr -d '\r\n ' < "$G/sha")
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || { echo "GitHub'dan beklenmeyen cevap."; durum ulasilamadi "Beklenmeyen cevap"; exit 0; }
yeniEtag=$(grep -i '^etag:' "$G/baslik" | head -1 | cut -d' ' -f2- | tr -d '\r')
etagYaz() { printf '%s' "$yeniEtag" > "$D/etag"; }
if [ "$sha" = "$kurulu" ]; then etagYaz; durum tamam; exit 0; fi
if [ "$sha" = "$basarisiz" ]; then etagYaz; durum basarisiz "${sha:0:7} kurulamadı; ${kurulu:0:7} ile devam ediliyor, yenisi bekleniyor."; exit 0; fi
echo "Yeni sürüm: ${sha:0:7} (kurulu: ${kurulu:0:7})"

# 2) İndir ve denetle: her şey tek klasörün altında, ".." ve bağlantı (link) yok
kok="${DEPO#*/}-$sha"
if ! curl -fsSL --max-time 300 --max-filesize 209715200 -H 'User-Agent: whitenote-guncelle' -o "$G/a.tgz" \
     "$ARSIV/$DEPO/tar.gz/$sha" 2>"$G/hata"; then
  echo "İndirilemedi: $(head -c 200 "$G/hata")"; durum ulasilamadi "Yeni sürüm indirilemedi"; exit 0
fi
olmadi() { echo "Kurulmadı: $1"; echo "$sha" > "$D/basarisiz"; etagYaz; durum basarisiz "${sha:0:7}: $1"; exit 0; }
tar -tzf "$G/a.tgz" > "$G/liste" 2>/dev/null && tar -tvzf "$G/a.tgz" > "$G/turler" 2>/dev/null || olmadi "arşiv bozuk"
grep -qvE "^$kok(/|\$)" "$G/liste" && olmadi "arşivde beklenmeyen yol"
grep -qE '(^|/)\.\.(/|$)' "$G/liste" && olmadi "arşivde .. var"
grep -qvE '^[-d]' "$G/turler" && olmadi "arşivde bağlantı ya da özel dosya var"
mkdir "$G/x" && tar -xzf "$G/a.tgz" -C "$G/x" --no-same-owner --no-same-permissions 2>"$G/hata" || olmadi "arşiv açılamadı"
Y="$G/x/$kok"
chmod -R a+rX "$Y"
for f in index.html sunucu/whitenote-sunucu.js manifest.webmanifest; do [ -s "$Y/$f" ] || olmadi "eksik dosya: $f"; done
grep -q '<meta name="wn-sunucu" content="">' "$Y/index.html" || olmadi "index.html beklenen biçimde değil"
NODE=$(command -v node || echo /usr/local/bin/node)
if ! runuser -u whitenote -- "$NODE" --check "$Y/sunucu/whitenote-sunucu.js" 2>"$G/hata"; then
  olmadi "sunucu kodunda söz dizimi hatası ($(grep -m1 -E '^[A-Za-z]*Error' "$G/hata" | cut -c1-120))"
fi

# 3) Kur: yeni kopya hazırlanır, yer değiştirilir, hizmet yeniden başlar; sunucu cevap vermezse geri dönülür
rm -rf "$UYG.yeni" "$UYG.eski"
cp -r "$Y" "$UYG.yeni" && chown -R whitenote: "$UYG.yeni" || { rm -rf "$UYG.yeni"; durum basarisiz "kopyalanamadı (disk dolu mu?)"; exit 1; }
mv "$UYG" "$UYG.eski" && mv "$UYG.yeni" "$UYG" || { [ -d "$UYG" ] || mv "$UYG.eski" "$UYG"; durum basarisiz "yer değiştirilemedi"; exit 1; }
systemctl restart whitenote
saglam() {
  for _ in $(seq 1 30); do
    curl -fsS --max-time 2 "http://127.0.0.1:$PORT/api/durum" >/dev/null 2>&1 && return 0
    sleep 1
  done
  return 1
}
if saglam; then
  rm -rf "$UYG.eski"
  echo "$sha" > "$D/kurulu"; simdi > "$D/zaman"; rm -f "$D/basarisiz"; etagYaz
  durum tamam "${sha:0:7} kuruldu"
  echo "Güncellendi: ${sha:0:7}"
else
  echo "Yeni sürüm açılmadı; eski sürüme dönülüyor. Son kayıtlar:"
  journalctl -u whitenote -n 25 --no-pager -o cat 2>/dev/null || true
  rm -rf "$UYG" && mv "$UYG.eski" "$UYG"
  systemctl restart whitenote
  saglam && echo "Önceki sürüm çalışıyor." || echo "UYARI: önceki sürüm de cevap vermiyor."
  echo "$sha" > "$D/basarisiz"; etagYaz
  durum basarisiz "${sha:0:7} açılmadı; önceki sürümle devam ediliyor"
fi
