/* ==========================================================================
   NOTLARIM - script.js (Mantık / İşleyiş)
   Uygulamanın tüm davranışı burada: not/görev ekleme-silme, kaydetme,
   arama, tema, dışa/içe aktarma. index.html bu dosyayı <script> ile çağırır.
   ========================================================================== */

  /* ===================================================================
     JAVASCRIPT BÖLÜMÜ - Uygulamanın TÜM İŞLEYİŞİ burada.
     Genel akış her zaman şudur:
       Kullanıcı bir şey yapar (tıklar/yazar)
         -> ilgili fonksiyon çalışır
         -> bellekteki veri güncellenir (projects / items dizileri)
         -> veri kalıcı olarak kaydedilir
         -> ekran yeniden çizilir (render)
     =================================================================== */

  /* ---- BELLEKTEKİ VERİ (state) ----
     Uygulamanın "gerçek" verisi bu değişkenlerde tutulur.
     Ekranda görünen her şey bunların bir yansımasıdır. */
  let projects = [];         // Tüm projeler. Her proje: {id, name, created}
  let items = [];            // Tüm notlar+görevler. Her öğe: {id, projectId, type, title, body, tags, done, pinned, created}
  let activeProject = null;  // O an açık olan projenin id'si
  let composerType = 'note'; // Ekleme kutusunda seçili tür: 'note' (not) veya 'task' (görev)
  let storageOK = true;      // Kalıcı depolama çalışıyor mu? (çalışmazsa uygulama yine de açılır)

  /* Kısa yardımcı: id'sine göre bir HTML öğesini bulur.
     el('add') yazmak, document.getElementById('add') yazmanın kısa halidir. */
  const el = id => document.getElementById(id);

  /* ---- DEPOLAMA SARMALAYICILARI (güvenli erişim) ----
     window.storage kalıcı depodur. Bazı ortamlarda bulunmayabilir; o yüzden
     her çağrıyı try/catch ile sarıp hata olursa uygulamanın çökmesini engelliyoruz.
     (sGet=oku, sSet=yaz, sDel=sil, sList=anahtarları listele) */
  async function sGet(k){ try { return await window.storage.get(k); } catch(e){ return null; } }
  async function sSet(k,v){ try { const r = await window.storage.set(k,v); return !!r; } catch(e){ storageOK=false; return false; } }
  async function sDel(k){ try { await window.storage.delete(k); } catch(e){} }
  async function sList(p){ try { const r = await window.storage.list(p); return (r && r.keys) ? r.keys : []; } catch(e){ return null; } }

  /* ---- BAŞLANGIÇ: her şeyi yükle ----
     Sayfa açılınca çalışır. Depodan kayıtlı projeleri ve öğeleri okuyup
     belleğe alır, sonra ekranı çizer. Hiç proje yoksa "Genel" oluşturur. */
  async function loadAll() {
    let okStorage = true;

    // Depo hiç yoksa (örn. dosyayı bilgisayarda açtıysan) işaretle
    if (typeof window.storage === 'undefined') { okStorage = false; }

    if (okStorage) {
      // 'proj:' ile başlayan tüm anahtarları al = tüm projeler
      const pkeys = await sList('proj:');
      if (pkeys === null) { okStorage = false; }   // listeleme başarısızsa depo çalışmıyor demektir
      else {
        const plist = [];
        for (const k of pkeys) {
          const it = await sGet(k);
          // Depoda metin olarak saklanan veriyi JSON.parse ile nesneye çeviriyoruz
          if (it && it.value) { try { plist.push(JSON.parse(it.value)); } catch(e){} }
        }
        projects = plist.sort((a,b) => a.created - b.created); // Oluşturma zamanına göre sırala

        // Aynısını 'item:' ile başlayan anahtarlar için yap = tüm not/görevler
        const ikeys = await sList('item:') || [];
        const ilist = [];
        for (const k of ikeys) {
          const it = await sGet(k);
          if (it && it.value) { try { ilist.push(JSON.parse(it.value)); } catch(e){} }
        }
        items = ilist;
      }
    }

    storageOK = okStorage;
    // Depo çalışmıyorsa kullanıcıyı bilgilendir (veriler sadece bu oturumda kalır)
    if (!storageOK) {
      el('status').textContent = 'Kalıcı depolama kullanılamıyor — değişiklikler bu oturumda tutulur.';
    }

    // Hiç proje yoksa varsayılan "Genel" projesini oluştur
    if (projects.length === 0) {
      const p = { id: uid(), name: 'Genel', created: Date.now() };
      projects.push(p);
      activeProject = p.id;
      if (storageOK) await sSet('proj:' + p.id, JSON.stringify(p));
    } else {
      activeProject = projects[0].id; // Varsa ilk projeyi aç
    }

    renderProjects(); // Sol listeyi çiz
    renderMain();     // Ana alanı çiz
  }

  /* ---- KAYDETME (kalıcılaştırma) ----
     Bir projeyi/öğeyi depoya yazar. Nesneyi JSON.stringify ile metne çevirip
     benzersiz bir anahtarla ('proj:ID' veya 'item:ID') saklar. */
  async function saveProject(p) { if (storageOK) await sSet('proj:' + p.id, JSON.stringify(p)); }
  async function saveItem(i) { if (storageOK) await sSet('item:' + i.id, JSON.stringify(i)); }
  async function deleteItemStore(id) { if (storageOK) await sDel('item:' + id); }

  /* Benzersiz kimlik (ID) üretir: zaman + rastgele harfler.
     Her not, görev ve projenin birbirinden ayırt edilmesi için gerekir. */
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

  /* ---- PROJE OLUŞTUR ----
     Yeni proje nesnesi yapar, listeye ekler, aktif yapar, kaydeder, ekranı tazeler. */
  async function createProject(name) {
    const p = { id: uid(), name: name, created: Date.now() };
    projects.push(p);
    activeProject = p.id;
    await saveProject(p);
    renderProjects();
    renderMain();
    return p;
  }

  /* ---- PROJE SİL ----
     Önce onay sorar. Projeye ait tüm öğeleri ve projenin kendisini hem bellekten
     hem depodan siler. Hiç proje kalmazsa yeni "Genel" açar. */
  async function deleteProject(id) {
    const p = projects.find(x => x.id === id);
    const cnt = items.filter(i => i.projectId === id).length; // bu projedeki öğe sayısı
    if (!confirm('"' + p.name + '" projesi ve içindeki ' + cnt + ' öğe silinsin mi?')) return;

    // Projenin tüm öğelerini sil
    for (const i of items.filter(x => x.projectId === id)) { await deleteItemStore(i.id); }
    items = items.filter(i => i.projectId !== id);  // bellekten de çıkar

    await sDel('proj:' + id);
    projects = projects.filter(x => x.id !== id);

    if (projects.length === 0) { await createProject('Genel'); return; }
    if (activeProject === id) activeProject = projects[0].id; // silinen aktifse başka projeye geç
    renderProjects();
    renderMain();
  }

  /* ---- SOL PROJE LİSTESİNİ ÇİZ ----
     projects dizisini gezip her proje için bir satır HTML'i üretir ve ekrana yazar.
     Sonra her satıra tıklama olayını bağlar (seçme / silme). */
  function renderProjects() {
    el('projList').innerHTML = projects.map(p => {
      const cnt = items.filter(i => i.projectId === p.id).length; // öğe sayısı rozeti
      return '<div class="proj ' + (p.id===activeProject?'active':'') + '" data-id="' + p.id + '">' +
        '<span class="proj-name">' + esc(p.name) + '</span>' +
        '<span class="proj-right"><span class="proj-count">' + cnt + '</span>' +
        '<span class="proj-x" data-del="' + p.id + '">&#10005;</span></span></div>';
    }).join('');

    // Her proje satırına tıklama davranışı ekle
    el('projList').querySelectorAll('.proj').forEach(d => {
      d.addEventListener('click', e => {
        if (e.target.dataset.del) { deleteProject(e.target.dataset.del); return; } // çarpıya basıldıysa sil
        activeProject = d.dataset.id;   // değilse o projeyi aç
        el('search').value = '';        // aramayı temizle
        closeDrawer();                  // mobilde çekmeceyi kapat
        renderProjects(); renderMain();
      });
    });
  }

  /* ---- YENİ NOT/GÖREV EKLE ----
     Kutulardaki başlık, içerik ve etiketleri okur. Boşsa hiçbir şey yapmaz.
     Yeni öğe nesnesi oluşturur, listeye ekler, kaydeder, kutuları temizler, ekranı tazeler. */
  async function addItem() {
    const title = el('cTitle').value.trim();
    const body = el('cBody').value.trim();
    // Etiketleri virgülden böl, boşlukları at, boş olanları çıkar -> dizi yap
    const tags = el('cTags').value.split(',').map(t => t.trim()).filter(Boolean);
    if (!title && !body) return; // tamamen boşsa ekleme

    const item = {
      id: uid(),
      projectId: activeProject,                                    // hangi projeye ait
      type: composerType,                                          // 'note' ya da 'task'
      title: title || (composerType==='task' ? '' : 'Başlıksız'),  // not başlıksızsa varsayılan ver
      body: body,
      tags: tags,
      done: false,    // görev başlangıçta tamamlanmamış
      pinned: false,  // başlangıçta sabitlenmemiş
      created: Date.now()
    };
    items.push(item);
    await saveItem(item);

    // Kutuları temizle ki yeni giriş yapılabilsin
    el('cTitle').value = ''; el('cBody').value = ''; el('cTags').value = '';
    renderProjects(); renderMain();
    el('cTitle').focus(); // imleci tekrar başlığa al
  }

  /* ---- DURUM DEĞİŞTİREN KÜÇÜK FONKSİYONLAR ----
     Önce ilgili öğeyi id'sinden bul, değerini ters çevir, kaydet, ekranı tazele. */
  async function toggleDone(id) { const i = items.find(x => x.id === id); i.done = !i.done; await saveItem(i); renderMain(); }   // görev tamam/değil
  async function togglePin(id) { const i = items.find(x => x.id === id); i.pinned = !i.pinned; await saveItem(i); renderMain(); } // sabitle/çöz
  async function removeItem(id) { await deleteItemStore(id); items = items.filter(i => i.id !== id); renderProjects(); renderMain(); } // sil

  /* ---- ANA ALANI ÇİZ (en sık çalışan fonksiyon) ----
     1) Aktif projenin adını yazar.
     2) Görev varsa ilerleme çubuğunu hesaplar.
     3) Arama kutusuna göre öğeleri süzer.
     4) Sabitlenmişleri öne, sonra yeniden eskiye sıralar.
     5) Her öğeyi HTML'e çevirip ekrana basar. */
  function renderMain() {
    const p = projects.find(x => x.id === activeProject);
    el('projTitle').textContent = p ? p.name : '—';

    let mine = items.filter(i => i.projectId === activeProject); // sadece bu projenin öğeleri

    // --- İlerleme çubuğu ---
    const tasks = mine.filter(i => i.type === 'task');
    if (tasks.length > 0) {
      const done = tasks.filter(t => t.done).length;
      const pct = Math.round(done / tasks.length * 100);   // tamamlanma yüzdesi
      el('progressWrap').style.display = 'block';
      el('progressFill').style.width = pct + '%';
      el('progressLabel').textContent = done + '/' + tasks.length + ' görev tamamlandı · %' + pct;
    } else {
      el('progressWrap').style.display = 'none'; // görev yoksa çubuğu gizle
    }

    // --- Arama süzgeci ---
    const q = el('search').value.trim().toLowerCase();
    if (q) {
      mine = mine.filter(i => {
        // başlık + içerik + etiketleri tek metne birleştirip arama kelimesini içeriyor mu bak
        const hay = (i.title + ' ' + i.body + ' ' + i.tags.map(t=>'#'+t).join(' ')).toLowerCase();
        return hay.includes(q.replace(/^#/, '')); // baştaki # işaretini yok say
      });
    }

    // --- Sıralama: önce sabitlenmişler, sonra en yeni ---
    mine.sort((a,b) => (b.pinned - a.pinned) || (b.created - a.created));

    // Hiç öğe yoksa uygun mesaj göster
    if (mine.length === 0) {
      el('list').innerHTML = '<div class="empty">' + (q ? 'Eşleşen öğe yok.' : 'Bu projede henüz öğe yok.') + '</div>';
      return;
    }

    // Her öğeyi türüne göre uygun HTML'e çevir ve ekrana yaz
    el('list').innerHTML = mine.map(i => i.type === 'task' ? taskHTML(i) : noteHTML(i)).join('');
    bindItemEvents(); // yeni oluşan butonlara olayları bağla
  }

  /* Etiketleri rozet HTML'ine çevirir. Etiket yoksa boş döner. */
  function tagsHTML(tags) {
    if (!tags.length) return '';
    return '<div class="tags">' + tags.map(t => '<span class="tag">#' + esc(t) + '</span>').join('') + '</div>';
  }

  /* Bir NOT nesnesini kart HTML'ine çevirir. */
  function noteHTML(i) {
    return '<div class="item ' + (i.pinned?'pinned':'') + '">' +
      '<h3>' + esc(i.title) + '</h3>' +
      (i.body ? '<p>' + esc(i.body) + '</p>' : '') +
      tagsHTML(i.tags) +
      '<div class="meta"><span class="date">' + fmtDate(i.created) + '</span>' +
      '<div class="actions">' +
      '<button data-pin="' + i.id + '">' + (i.pinned?'Sabit ✓':'Sabitle') + '</button>' +
      '<button data-del="' + i.id + '">Sil</button></div></div></div>';
  }

  /* Bir GÖREV nesnesini kart HTML'ine çevirir (başında onay kutusu vardır). */
  function taskHTML(i) {
    return '<div class="item task ' + (i.pinned?'pinned':'') + ' ' + (i.done?'done':'') + '">' +
      '<input type="checkbox" class="task-check" data-check="' + i.id + '" ' + (i.done?'checked':'') + '>' +
      '<div class="task-body">' +
      '<div class="task-text">' + esc(i.title || i.body) + '</div>' +
      (i.title && i.body ? '<p>' + esc(i.body) + '</p>' : '') +
      tagsHTML(i.tags) +
      '<div class="meta"><span class="date">' + fmtDate(i.created) + '</span>' +
      '<div class="actions">' +
      '<button data-pin="' + i.id + '">' + (i.pinned?'Sabit ✓':'Sabitle') + '</button>' +
      '<button data-del="' + i.id + '">Sil</button></div></div></div></div>';
  }

  /* Çizimden sonra, yeni oluşan kartlardaki kutucuk ve butonlara
     tıklama/değişiklik olaylarını bağlar. */
  function bindItemEvents() {
    el('list').querySelectorAll('[data-check]').forEach(c => c.addEventListener('change', () => toggleDone(c.dataset.check)));
    el('list').querySelectorAll('[data-pin]').forEach(b => b.addEventListener('click', () => togglePin(b.dataset.pin)));
    el('list').querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => removeItem(b.dataset.del)));
  }

  /* ===================================================================
     DIŞA / İÇE AKTARMA
     Verileri farklı dosya biçimlerine dönüştürme ve geri okuma işlemleri.
     =================================================================== */

  /* Hangi projelerin aktarılacağını belirler: 'all' ise hepsi, değilse sadece açık proje. */
  function projectsToExport(scope) {
    return scope === 'all' ? projects : projects.filter(p => p.id === activeProject);
  }

  /* Seçilen projeleri MARKDOWN metnine çevirir (başlıklar #, görevler - [x] biçiminde). */
  function buildMarkdown(scope) {
    let out = '';
    projectsToExport(scope).forEach((p, idx) => {
      if (idx > 0) out += '\n\n---\n\n'; // projeler arası ayraç
      const mine = items.filter(i => i.projectId === p.id).sort((a,b)=>a.created-b.created);
      out += '# ' + p.name + '\n\n';
      const notes = mine.filter(i => i.type==='note');
      const tasks = mine.filter(i => i.type==='task');
      if (tasks.length) {
        out += '## Görevler\n';
        tasks.forEach(t => { out += '- [' + (t.done?'x':' ') + '] ' + (t.title || t.body) + (t.tags.length?' ('+t.tags.map(x=>'#'+x).join(' ')+')':'') + '\n'; });
        out += '\n';
      }
      if (notes.length) {
        out += '## Notlar\n';
        notes.forEach(n => { out += '\n### ' + n.title + '\n' + n.body + '\n' + (n.tags.length?n.tags.map(x=>'#'+x).join(' ')+'\n':''); });
      }
      if (!mine.length) out += '_Boş._\n';
    });
    return out;
  }

  /* Seçilen projeleri sade DÜZ METİN biçimine çevirir. */
  function buildPlainText(scope) {
    let out = '';
    projectsToExport(scope).forEach((p, idx) => {
      if (idx > 0) out += '\n========================================\n\n';
      const mine = items.filter(i => i.projectId === p.id).sort((a,b)=>a.created-b.created);
      out += p.name.toUpperCase() + '\n' + '-'.repeat(p.name.length) + '\n\n';
      const tasks = mine.filter(i => i.type==='task');
      const notes = mine.filter(i => i.type==='note');
      if (tasks.length) {
        out += 'GÖREVLER\n';
        tasks.forEach(t => { out += '  [' + (t.done?'X':' ') + '] ' + (t.title || t.body) + (t.tags.length?'  ('+t.tags.join(', ')+')':'') + '\n'; });
        out += '\n';
      }
      if (notes.length) {
        out += 'NOTLAR\n';
        notes.forEach(n => { out += '\n  ' + n.title + '\n' + (n.body?'  '+n.body.replace(/\n/g,'\n  ')+'\n':'') + (n.tags.length?'  Etiketler: '+n.tags.join(', ')+'\n':''); });
      }
      if (!mine.length) out += '(Boş)\n';
    });
    return out;
  }

  /* Bir metni dosya olarak indirir.
     Blob = bellekteki dosya. URL.createObjectURL = ona geçici bir indirme linki.
     Görünmez bir <a> oluşturup otomatik tıklayarak indirmeyi başlatır. */
  function download(content, filename, mime) {
    const blob = new Blob([content], {type: mime});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href); // geçici linki temizle
  }

  /* İndirilecek dosya için güvenli bir ad üretir (geçersiz karakterleri atar). */
  function safeName(scope) {
    if (scope === 'all') return 'tum-notlar';
    const p = projects.find(x => x.id === activeProject);
    return (p.name.replace(/[^\w ğüşıöçĞÜŞİÖÇ-]/g,'').trim() || 'proje');
  }

  /* Markdown ve düz metin indirme kısayolları */
  function exportMarkdown(scope){ download(buildMarkdown(scope), safeName(scope)+'.md', 'text/markdown'); }
  function exportText(scope){ download(buildPlainText(scope), safeName(scope)+'.txt', 'text/plain'); }

  /* PDF dışa aktarma:
     Notlar için biçimli bir HTML sayfası üretir, yeni sekmede açar ve
     tarayıcının yazdır penceresini çağırır. Kullanıcı oradan "PDF olarak kaydet" seçer.
     (Bu yöntem ek kütüphane gerektirmediği için dosyayı sade tutar.) */
  function exportPDF(scope) {
    const html = '<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>' + esc(safeName(scope)) + '</title>' +
      '<style>body{font-family:Georgia,serif;color:#2b2724;max-width:760px;margin:2rem auto;padding:0 1.5rem;line-height:1.6;}' +
      'h1{border-bottom:2px solid #2b2724;padding-bottom:.3rem;margin-top:2rem;}h2{color:#8a8378;font-size:1.05rem;text-transform:uppercase;letter-spacing:.05em;margin-top:1.4rem;}' +
      'h3{margin:1rem 0 .2rem;}.task{margin:.2rem 0;}.done{text-decoration:line-through;color:#8a8378;}' +
      '.tag{background:#f5e6dd;color:#c2410c;font-size:.75rem;padding:.1rem .5rem;border-radius:10px;font-family:monospace;margin-right:.3rem;}' +
      '.date{font-size:.75rem;color:#8a8378;}@media print{body{margin:0;}}</style></head><body>';
    let b = html;
    projectsToExport(scope).forEach(p => {
      const mine = items.filter(i => i.projectId === p.id).sort((a,b)=>a.created-b.created);
      b += '<h1>' + esc(p.name) + '</h1>';
      const tasks = mine.filter(i=>i.type==='task');
      const notes = mine.filter(i=>i.type==='note');
      if (tasks.length){
        b += '<h2>Görevler</h2>';
        tasks.forEach(t => { b += '<div class="task ' + (t.done?'done':'') + '">' + (t.done?'☑':'☐') + ' ' + esc(t.title||t.body) + ' ' + t.tags.map(x=>'<span class="tag">#'+esc(x)+'</span>').join('') + '</div>'; });
      }
      if (notes.length){
        b += '<h2>Notlar</h2>';
        notes.forEach(n => { b += '<h3>' + esc(n.title) + '</h3>' + (n.body?'<div>'+esc(n.body).replace(/\n/g,'<br>')+'</div>':'') + (n.tags.length?'<div>'+n.tags.map(x=>'<span class="tag">#'+esc(x)+'</span>').join('')+'</div>':''); });
      }
      if (!mine.length) b += '<p><em>Boş.</em></p>';
    });
    b += '</body></html>';
    const w = window.open('', '_blank');
    if (!w) { alert('PDF için açılır pencereye izin verin.'); return; }
    w.document.write(b);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 350); // sayfa yüklensin diye kısa bekleyip yazdır
  }

  /* JSON YEDEĞİ İNDİR:
     Tüm projeleri, öğeleri ve TEMA tercihini tek bir JSON dosyasına yazar (tam yedek). */
  function exportJSON() {
    // O anki tema: body'de "dark" sınıfı varsa karanlık, yoksa açık
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    const data = { version: 1, exported: Date.now(), theme: theme, projects: projects, items: items };
    download(JSON.stringify(data, null, 2), 'notlar-yedek-' + new Date().toISOString().slice(0,10) + '.json', 'application/json');
  }

  /* JSON YEDEĞİ YÜKLE:
     Seçilen yedek dosyasını okur, doğrular, onay sorar ve mevcut verinin
     ÜZERİNE yazar (eski veriyi depodan silip yenisini yazar). */
  async function importJSON(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.projects || !data.items) throw new Error('format'); // beklenen alanlar yoksa geçersiz
      if (!confirm('Yedek yüklensin mi? Mevcut projeler ve öğeler bununla DEĞİŞTİRİLECEK.')) return;

      // Mevcut depoyu temizle
      if (storageOK) {
        for (const p of projects) await sDel('proj:' + p.id);
        for (const i of items) await sDel('item:' + i.id);
      }
      // Yedekteki veriyi belleğe al
      projects = data.projects;
      items = data.items;
      // Depoya yaz
      if (storageOK) {
        for (const p of projects) await sSet('proj:' + p.id, JSON.stringify(p));
        for (const i of items) await sSet('item:' + i.id, JSON.stringify(i));
      }
      activeProject = projects.length ? projects[0].id : null;
      if (!activeProject) await createProject('Genel');

      // Yedekte tema bilgisi varsa onu uygula ve kaydet.
      // (Eski yedeklerde theme alanı olmayabilir; o zaman tema değişmez.)
      if (data.theme === 'dark' || data.theme === 'light') {
        const dark = (data.theme === 'dark');
        applyTheme(dark);
        if (storageOK) await sSet('pref:theme', data.theme);
      }

      renderProjects(); renderMain();
      el('status').textContent = 'Yedek yüklendi.';
    } catch(e) {
      alert('Geçersiz yedek dosyası.');
    }
  }

  /* Menüden seçilen butona göre doğru dışa/içe aktarma fonksiyonunu çağırır.
     (data-act değerine bakar; bir tür "yönlendirici"dir.) */
  function handleExportAction(act) {
    closeExportMenu();
    switch(act) {
      case 'proj-md': exportMarkdown('one'); break;
      case 'proj-txt': exportText('one'); break;
      case 'proj-pdf': exportPDF('one'); break;
      case 'all-md': exportMarkdown('all'); break;
      case 'all-txt': exportText('all'); break;
      case 'all-pdf': exportPDF('all'); break;
      case 'json-export': exportJSON(); break;
      case 'json-import': el('importFile').click(); break; // gizli dosya seçiciyi aç
    }
  }

  /* ---- YARDIMCI FONKSİYONLAR ---- */

  /* Bilgisayarın anladığı zaman değerini (ör. 1717440000000) okunabilir
     "03.06.2026 22:58" biçimine çevirir. */
  function fmtDate(ts) {
    return new Date(ts).toLocaleString('tr-TR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }

  /* GÜVENLİK: Kullanıcının yazdığı metni "zararsız" hale getirir.
     Örn. biri başlığa <script> yazsa bile bu kod onu zararlı çalıştırmaz,
     sadece düz yazı olarak gösterir. (XSS denen saldırıyı engeller.) */
  function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  /* ---- MOBİL ÇEKMECE (sol panel) aç/kapa ---- */
  function openDrawer(){ el('app').classList.add('drawer-open'); }
  function closeDrawer(){ el('app').classList.remove('drawer-open'); }
  el('menuBtn').addEventListener('click', openDrawer);   // ☰ butonu -> aç
  el('overlay').addEventListener('click', closeDrawer);  // karartıya tıkla -> kapat

  /* ---- OLAY BAĞLAMALARI (kullanıcı etkileşimleri) ----
     Hangi butona basılınca hangi fonksiyon çalışacağını burada tanımlarız. */

  // Yeni proje ekle (butona basınca veya Enter'a basınca)
  el('addProj').addEventListener('click', () => {
    const n = el('newProj').value.trim();
    if (n) { createProject(n); el('newProj').value = ''; closeDrawer(); }
  });
  el('newProj').addEventListener('keydown', e => { if (e.key==='Enter') el('addProj').click(); });

  // Not / Görev türü seçimi
  el('tNote').addEventListener('click', () => setType('note'));
  el('tTask').addEventListener('click', () => setType('task'));
  function setType(t) {
    composerType = t;
    el('tNote').classList.toggle('sel', t==='note'); // seçili düğmeyi vurgula
    el('tTask').classList.toggle('sel', t==='task');
    // Seçime göre kutu ipuçlarını (placeholder) değiştir
    el('cBody').placeholder = t==='task' ? 'Görev açıklaması (opsiyonel)...' : 'İçerik...';
    el('cTitle').placeholder = t==='task' ? 'Görev' : 'Başlık';
  }

  // Ekle butonu ve Ctrl/Cmd+Enter kısayolu
  el('add').addEventListener('click', addItem);
  el('cBody').addEventListener('keydown', e => { if ((e.metaKey||e.ctrlKey) && e.key==='Enter') addItem(); });

  // Arama kutusuna her yazıldığında listeyi süz
  el('search').addEventListener('input', renderMain);

  /* ---- DIŞA AKTARMA MENÜSÜ aç/kapa ---- */
  function openExportMenu(){ el('exportMenu').classList.add('open'); }
  function closeExportMenu(){ el('exportMenu').classList.remove('open'); }
  el('export').addEventListener('click', (e) => {
    e.stopPropagation();                      // tıklamanın "dışarı tıklama" sayılmasını engelle
    el('exportMenu').classList.toggle('open'); // menüyü aç/kapat
  });
  // Menü içindeki bir butona basılınca ilgili işlemi yap
  el('exportMenu').addEventListener('click', (e) => {
    const act = e.target.dataset.act;
    if (act) handleExportAction(act);
  });
  // Menünün dışına tıklanınca menüyü kapat
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.export-wrap')) closeExportMenu();
  });
  // Dosya seçilince yedeği yükle
  el('importFile').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (f) importJSON(f);
    e.target.value = ''; // aynı dosya tekrar seçilebilsin diye sıfırla
  });

  /* ---- KARANLIK / AÇIK TEMA ----
     Düğmeye basınca body'ye "dark" sınıfı eklenir/çıkar. Tüm renkler CSS
     değişkenlerine bağlı olduğu için arayüz topluca değişir.
     Seçim depoya kaydedilir, böylece sonraki açılışta hatırlanır. */
  function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    // Karanlıkta güneş (açığa dön), açıkta ay (karanlığa geç) ikonu göster
    el('themeBtn').innerHTML = dark ? '&#9728;' : '&#9789;'; // ☀ / ☾
  }

  async function toggleTheme() {
    const dark = !document.body.classList.contains('dark');
    applyTheme(dark);
    if (storageOK) await sSet('pref:theme', dark ? 'dark' : 'light');
  }

  async function loadTheme() {
    let dark = false;
    // Önce kayıtlı tercihe bak
    const saved = await sGet('pref:theme');
    if (saved && saved.value) {
      dark = (saved.value === 'dark');
    } else if (window.matchMedia) {
      // Kayıt yoksa cihazın sistem temasını baz al
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme(dark);
  }

  el('themeBtn').addEventListener('click', toggleTheme);

  /* ---- UYGULAMAYI BAŞLAT ----
     Her şey tanımlandı; şimdi temayı ve kayıtlı veriyi yükleyip ekranı çiziyoruz. */
  loadTheme();
  loadAll();
