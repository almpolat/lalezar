// =============================================================
//  ORTAK ARAYÜZ: üst menü, alt bilgi, ürün kartı, sepet
// =============================================================
(function () {
  const CFG = window.LALEZAR_CONFIG;
  const S = CFG.shop;

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0) + " TL";
  const param = (k) => new URLSearchParams(location.search).get(k);
  const slugify = (s) => String(s).toLocaleLowerCase("tr").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const waLink = (text) => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(text || "")}`;

  // ---------------- İLLÜSTRASYON (fotoğraf yokken) ----------------
  // Logodaki düz, beyaz konturlu çiçek diliyle çizilir.
  function rng(seed) {
    let h = 2166136261;
    for (const c of String(seed)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function mix(hex, to, amt) {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const a = p(hex), b = p(to);
    return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * amt).toString(16).padStart(2, "0")).join("");
  }
  const LEAF = "#B7C80A", STEM = "#4E6B2A", INK = "#22301B";

  function bloom(x, y, r, color, rot, petals = 8) {
    const center = color.toLowerCase() === "#ffffff" ? "#F2B705" : "#FFFFFF";
    let s = `<g stroke="#fff" stroke-width="${Math.max(2, r * 0.09)}">`;
    for (let i = 0; i < petals; i++) {
      const a = rot + (i * Math.PI * 2) / petals;
      s += `<circle cx="${x + Math.cos(a) * r * 0.62}" cy="${y + Math.sin(a) * r * 0.62}" r="${r * 0.42}" fill="${color}"/>`;
    }
    s += `<circle cx="${x}" cy="${y}" r="${r * 0.52}" fill="${color}"/></g>`;
    s += `<circle cx="${x}" cy="${y}" r="${r * 0.32}" fill="${center}"/><circle cx="${x}" cy="${y}" r="${r * 0.15}" fill="${color === "#FFFFFF" ? "#F28C28" : color}"/>`;
    return s;
  }
  function leaf(x, y, len, angle, color = LEAF) {
    return `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M0 0 C ${len * 0.3} ${-len * 0.35}, ${len * 0.75} ${-len * 0.3}, ${len} 0 C ${len * 0.75} ${len * 0.3}, ${len * 0.3} ${len * 0.35}, 0 0 Z" fill="${color}"/><path d="M0 0 L ${len * 0.85} 0" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>`;
  }
  function cluster(r, cx, cy, spread, count, colors, sizeMin, sizeMax) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * spread;
      pts.push([cx + Math.cos(a) * d * 1.15, cy + Math.sin(a) * d * 0.8, sizeMin + r() * (sizeMax - sizeMin), colors[i % colors.length], r() * 6]);
    }
    pts.sort((a, b) => a[1] - b[1]);
    let s = "";
    for (let i = 0; i < 5; i++) s += leaf(cx + (r() - 0.5) * spread * 2.2, cy + (r() - 0.3) * spread, 40 + r() * 30, [200, 250, 300, 330, 160][i]);
    pts.forEach(([x, y, sz, c, rot]) => (s += bloom(x, y, sz, c, rot)));
    return s;
  }

  function art(p) {
    const [c1, c2] = p.art && p.art.length ? p.art : ["#F28C28", "#FFFFFF"];
    const r = rng(p.id || p.name);
    const bg = mix(c1 === "#FFFFFF" ? "#C2D10A" : c1, "#ffffff", 0.84);
    const colors = [c1, c2, c1];
    let body = "";
    switch (p.type) {
      case "vazoda-aranjman":
        body = cluster(r, 200, 175, 70, 9, colors, 26, 40) +
          `<path d="M150 235 Q140 300 160 360 L240 360 Q260 300 250 235 Z" fill="#DDEBE6" stroke="#fff" stroke-width="5"/><path d="M165 250 Q158 300 170 345" stroke="#fff" stroke-width="5" fill="none" opacity=".8"/>`;
        break;
      case "kutuda-cicek":
      case "cicek-cikolata":
        body = cluster(r, 200, 205, 72, 11, colors, 26, 38) +
          `<rect x="118" y="238" width="164" height="118" rx="8" fill="${INK}"/><ellipse cx="200" cy="238" rx="82" ry="14" fill="#35472A"/><rect x="118" y="286" width="164" height="12" fill="#C2D10A"/>`;
        if (p.type === "cicek-cikolata") {
          body += [80, 106, 294, 320].map((x, i) => `<rect x="${x - 11}" y="${330 - (i % 2) * 18}" width="22" height="22" rx="5" fill="#6B3E26" stroke="#fff" stroke-width="3"/>`).join("");
        }
        break;
      case "orkide": {
        const stems = [[-1, 1], [1, 1], [0, 1.25]];
        body = `<path d="M150 300 L250 300 L238 365 L162 365 Z" fill="${INK}"/><rect x="144" y="292" width="112" height="14" rx="4" fill="#C2D10A"/>`;
        body += leaf(200, 296, 70, 200, LEAF) + leaf(200, 296, 70, 340, LEAF);
        stems.forEach(([dir, h], i) => {
          const ex = 200 + dir * 70, ey = 300 - 190 * h;
          body += `<path d="M200 300 Q ${200 + dir * 10} ${200} ${ex} ${ey}" stroke="${STEM}" stroke-width="5" fill="none"/>`;
          for (let k = 0; k < 4; k++) {
            const t = 0.45 + k * 0.17, bx = 200 + (ex - 200) * t + dir * 12, by = 300 + (ey - 300) * t;
            body += bloom(bx, by, 22 - k * 2, k % 2 ? c1 : c2 === "#FFFFFF" ? c1 : c1, r() * 3, 5);
          }
        });
        break;
      }
      case "saksi-bitkileri":
        body = `<path d="M150 285 L250 285 L238 365 L162 365 Z" fill="#F28C28"/><rect x="142" y="276" width="116" height="16" rx="4" fill="#E07B12"/>`;
        [[-60, 120], [-30, 150], [0, 165], [30, 150], [60, 120], [-15, 135], [15, 135]].forEach(([dx, h]) => {
          const a = -90 + dx * 0.7;
          body += `<path d="M200 282 L ${200 + dx} ${282 - h}" stroke="${STEM}" stroke-width="4"/>` + leaf(200 + dx * 0.55, 282 - h * 0.55, 60, a - 30, c1) + leaf(200 + dx * 0.85, 282 - h * 0.85, 50, a + 20, c2);
        });
        break;
      default: // buket, gul
        body = cluster(r, 200, 170, 76, p.type === "gul" ? 13 : 10, colors, p.type === "gul" ? 22 : 26, p.type === "gul" ? 30 : 40) +
          `<path d="M120 215 L280 215 L222 370 L178 370 Z" fill="#E9D3B4"/><path d="M120 215 L200 250 L178 370 Z" fill="#DCC29F"/><path d="M170 300 Q200 315 230 300 L226 318 Q200 330 174 318 Z" fill="#C2D10A"/>`;
    }
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(p.name)}" class="w-full h-full block"><rect width="400" height="400" fill="${bg}"/>${body}</svg>`;
  }

  // Fotoğraf varsa fotoğraf, yoksa (ya da yüklenemezse) illüstrasyon
  function productImage(p, cls = "") {
    if (!p.image) return art(p);
    return `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" class="w-full h-full object-cover ${cls}" onerror="this.outerHTML=UI.art(${esc(JSON.stringify({ id: p.id, name: p.name, type: p.type, art: p.art }))})">`;
  }

  // ---------------- SEPET ----------------
  const CART_KEY = "lz_cart";
  const Cart = {
    items() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } },
    save(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); Cart.badge(); },
    add(p, qty = 1) {
      const items = Cart.items(); const it = items.find((x) => x.id === p.id);
      if (it) it.qty += qty; else items.push({ id: p.id, qty });
      Cart.save(items); toast(p, qty);
    },
    setQty(id, qty) { let items = Cart.items(); const it = items.find((x) => x.id === id); if (it) it.qty = qty; items = items.filter((x) => x.qty > 0); Cart.save(items); },
    clear() { Cart.save([]); },
    count() { return Cart.items().reduce((a, b) => a + b.qty, 0); },
    badge() { document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = Cart.count(); }); }
  };

  // Sepete eklenince sağ üstte açılan küçük pencere (Shopify tarzı)
  function toast(p, qty) {
    let t = $("#lz-toast");
    if (!t) { t = document.createElement("div"); t.id = "lz-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.className = "fixed right-4 top-4 z-[60] w-[min(360px,calc(100vw-2rem))] bg-white border border-line shadow-2xl p-5";
    if (typeof p === "string") { t.innerHTML = `<p class="text-sm">${esc(p)}</p>`; }
    else t.innerHTML = `
      <div class="flex items-center justify-between mb-4"><p class="text-[13px] tracking-wide uppercase">✓ Sepete eklendi</p><button class="text-xl leading-none" aria-label="Kapat" onclick="this.closest('#lz-toast').remove()">×</button></div>
      <div class="flex gap-4 items-center"><div class="w-16 h-16 shrink-0 overflow-hidden bg-mist">${productImage(p)}</div><div><p class="font-display text-lg leading-tight">${esc(p.name)}</p><p class="text-sm text-ink/60">${qty} adet</p></div></div>
      <div class="grid grid-cols-2 gap-2 mt-5"><a href="sepet.html" class="btn btn-outline !py-3 !text-xs">Sepeti gör (${Cart.count()})</a><a href="sepet.html#odeme" class="btn btn-dark !py-3 !text-xs">Sipariş ver</a></div>`;
    clearTimeout(t._h); t._h = setTimeout(() => t.remove(), 4500);
  }

  // ---------------- ÜRÜN KARTI ----------------
  function productCard(p) {
    const sale = p.oldPrice && p.oldPrice > p.price;
    const url = `urun.html?id=${encodeURIComponent(p.id)}`;
    return `<article class="group text-center">
      <a href="${url}" class="block aspect-square overflow-hidden bg-mist relative">
        <div class="w-full h-full transition-transform duration-700 group-hover:scale-105">${productImage(p)}</div>
        ${sale ? `<span class="absolute top-3 left-3 bg-orange text-white text-[11px] tracking-wider uppercase px-2.5 py-1">İndirim</span>` : ""}
      </a>
      <h3 class="mt-4 text-[15px] leading-snug"><a href="${url}" class="hover:underline underline-offset-4">${esc(p.name)}</a></h3>
      <p class="mt-1 text-[15px]">${sale ? `<s class="text-ink/45 mr-2">${money(p.oldPrice)}</s>` : ""}<span class="${sale ? "text-orange" : ""}">${money(p.price)}</span></p>
      <button data-add="${esc(p.id)}" class="btn btn-outline w-full mt-3 !py-2.5 !text-xs">Sepete Ekle</button>
    </article>`;
  }
  function bindAddButtons(root, products) {
    root.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => {
      const p = products.find((x) => x.id === b.dataset.add); if (p) Cart.add(p, 1);
    }));
  }

  // ---------------- İKONLAR ----------------
  const icon = {
    search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
    bag: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
    phone: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>`,
    wa: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z"/></svg>`,
    menu: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
    ig: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`,
    down: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`
  };

  // ---------------- ÜST MENÜ ----------------
  async function renderHeader() {
    const el = $("#site-header"); if (!el) return;
    const cats = await Store.getCategories();
    const d = CFG.delivery;
    const msgs = [
      d.cutoff ? `İstanbul içi ${d.cutoff}'e kadar verilen siparişler aynı gün teslim edilir` : "İstanbul içi aynı gün teslimat",
      "Her siparişe ücretsiz kart notu",
      `Sipariş hattı: ${S.phone}`
    ];
    const run = [...msgs, ...msgs, ...msgs, ...msgs].map((m) => `<span class="px-10">${esc(m)}</span>`).join("");
    const mega = `
      <div class="grid grid-cols-3 gap-10 max-w-5xl mx-auto px-6 py-10 text-[14px]">
        <div><p class="menu-title">Çiçekler</p><a href="kategori.html" class="menu-item">Tüm Çiçekler</a>${cats.types.map((c) => `<a href="kategori.html?tur=${c.slug}" class="menu-item">${esc(c.name)}</a>`).join("")}</div>
        <div><p class="menu-title">Gönderim Sebebi</p>${cats.occasions.map((c) => `<a href="kategori.html?sebep=${c.slug}" class="menu-item">${esc(c.name)}</a>`).join("")}</div>
        <a href="kategori.html?tur=buket" class="block group"><div class="aspect-[4/3] overflow-hidden bg-mist"><img src="https://images.unsplash.com/photo-1523693916903-027d144a2b7d?auto=format&fit=crop&w=600&h=450&q=70" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"></div><p class="mt-3 tracking-[.18em] uppercase text-[12px]">Buketleri keşfet</p></a>
      </div>`;
    el.innerHTML = `
      <div class="bg-ink text-white text-[12px] tracking-[.12em] uppercase overflow-hidden whitespace-nowrap py-2.5"><div class="marquee inline-block">${run}</div></div>
      <header class="bg-white border-b border-line sticky top-0 z-40">
        <div class="max-w-[1400px] mx-auto px-4 sm:px-8 h-[84px] grid grid-cols-[1fr_auto_1fr] items-center">
          <div class="flex items-center gap-4">
            <button id="menu-btn" class="lg:hidden" aria-label="Menüyü aç">${icon.menu}</button>
            <button id="search-btn" class="hidden lg:flex items-center gap-2 text-[13px] tracking-wide text-ink/70 hover:text-ink" aria-label="Ara">${icon.search}<span>Ara</span></button>
            <a href="tel:${S.phoneTel}" class="hidden xl:flex items-center gap-2 text-[13px] tracking-wide text-ink/70 hover:text-ink">${icon.phone}${esc(S.phone)}</a>
          </div>
          <a href="index.html" aria-label="${esc(S.name)} ana sayfa"><img src="assets/logo.png" alt="${esc(S.name)}" class="h-11 sm:h-[54px] w-auto"></a>
          <div class="flex items-center justify-end gap-4 sm:gap-5">
            <button id="search-btn-m" class="lg:hidden" aria-label="Ara">${icon.search}</button>
            <a href="${waLink("Merhaba, çiçek siparişi vermek istiyorum.")}" target="_blank" rel="noopener" class="hidden sm:block hover:text-orange" aria-label="WhatsApp">${icon.wa}</a>
            <a href="sepet.html" class="flex items-center gap-2 hover:text-orange" aria-label="Sepet">${icon.bag}<span class="text-[13px] whitespace-nowrap"><span class="hidden sm:inline">Sepet </span>(<span data-cart-count>0</span>)</span></a>
          </div>
        </div>
        <nav class="hidden lg:block" aria-label="Ana menü">
          <ul class="flex justify-center gap-9 text-[13px] tracking-[.14em] uppercase h-12 items-center">
            <li class="mega-parent h-full flex items-center"><a href="kategori.html" class="nav-link flex items-center gap-1.5">Çiçekler ${icon.down}</a>
              <div class="mega absolute left-0 right-0 top-full bg-white border-y border-line normal-case tracking-normal">${mega}</div></li>
            ${cats.types.slice(0, 4).map((c) => `<li><a href="kategori.html?tur=${c.slug}" class="nav-link">${esc(c.name)}</a></li>`).join("")}
            <li><a href="kategori.html?sebep=sevgiliye" class="nav-link">Sevgiliye</a></li>
            <li><a href="index.html#magaza" class="nav-link">Mağazamız</a></li>
          </ul>
        </nav>
        <div id="search-panel" class="hidden absolute left-0 right-0 top-0 bg-white border-b border-line z-50">
          <form action="kategori.html" class="max-w-[1400px] mx-auto px-4 sm:px-8 h-[84px] flex items-center gap-4">
            ${icon.search}<input name="q" type="search" placeholder="Ne arıyorsun? Gül, orkide, buket…" class="flex-1 text-lg outline-none" aria-label="Ara">
            <button type="button" id="search-close" class="text-2xl" aria-label="Kapat">×</button>
          </form>
        </div>
      </header>
      <div id="drawer" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-black/40" data-close></div>
        <aside class="absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-white overflow-y-auto">
          <div class="flex items-center justify-between px-6 h-16 border-b border-line"><img src="assets/logo.png" alt="" class="h-9"><button data-close class="text-3xl leading-none" aria-label="Menüyü kapat">×</button></div>
          <div class="px-6 py-4 text-[14px] tracking-[.1em] uppercase">
            <a href="kategori.html" class="drawer-link">Tüm Çiçekler</a>
            ${cats.types.map((c) => `<a href="kategori.html?tur=${c.slug}" class="drawer-link">${esc(c.name)}</a>`).join("")}
            <p class="text-[11px] text-ink/50 mt-6 mb-1">Gönderim sebebi</p>
            ${cats.occasions.map((c) => `<a href="kategori.html?sebep=${c.slug}" class="drawer-link">${esc(c.name)}</a>`).join("")}
            <a href="index.html#magaza" class="drawer-link mt-4">Mağazamız</a>
          </div>
          <div class="px-6 pb-8 text-sm space-y-2"><a href="tel:${S.phoneTel}" class="flex items-center gap-2">${icon.phone}${esc(S.phone)}</a><a href="https://www.instagram.com/${esc(S.instagram)}/" class="flex items-center gap-2">${icon.ig}@${esc(S.instagram)}</a></div>
        </aside>
      </div>`;
    const drawer = $("#drawer"), sp = $("#search-panel");
    $("#menu-btn").onclick = () => drawer.classList.remove("hidden");
    drawer.querySelectorAll("[data-close]").forEach((b) => (b.onclick = () => drawer.classList.add("hidden")));
    const openSearch = () => { sp.classList.remove("hidden"); sp.querySelector("input").focus(); };
    $("#search-btn").onclick = openSearch; $("#search-btn-m").onclick = openSearch;
    $("#search-close").onclick = () => sp.classList.add("hidden");
    Cart.badge();
  }

  // ---------------- ALT BİLGİ ----------------
  async function renderFooter() {
    const el = $("#site-footer"); if (!el) return;
    const cats = await Store.getCategories();
    const y = new Date().getFullYear();
    el.innerHTML = `
      <section class="border-t border-line mt-24">
        <div class="max-w-[1400px] mx-auto px-4 sm:px-8 py-14 grid md:grid-cols-[1fr_1fr] gap-8 items-center">
          <div><h2 class="font-display text-3xl">Bültenimize katılın</h2><p class="text-ink/60 mt-2 text-[15px]">Yeni koleksiyonlar ve özel gün kampanyalarından ilk siz haberdar olun.</p></div>
          <form class="flex border border-ink" onsubmit="event.preventDefault();this.innerHTML='<p class=&quot;p-4 text-sm&quot;>Teşekkürler, listeye eklendiniz.</p>'">
            <input type="email" required placeholder="E-posta adresiniz" class="flex-1 px-4 py-4 outline-none text-[15px] min-w-0" aria-label="E-posta">
            <button class="bg-ink text-white px-6 text-[12px] tracking-[.18em] uppercase">Üye Ol</button>
          </form>
        </div>
      </section>
      <footer class="bg-ink text-white/75 text-[14px]">
        <div class="max-w-[1400px] mx-auto px-4 sm:px-8 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div class="bg-white inline-block px-4 py-3"><img src="assets/logo.png" alt="${esc(S.name)}" class="h-10"></div>
            <p class="mt-5 leading-relaxed max-w-xs">Çiftehavuzlar'daki dükkânımızda her gün taze çiçeklerle hazırladığımız tasarımları İstanbul'un her yerine gün içinde ulaştırıyoruz.</p>
            <a href="https://www.instagram.com/${esc(S.instagram)}/" target="_blank" rel="noopener" class="inline-flex items-center gap-2 mt-5 text-white hover:text-lime">${icon.ig}@${esc(S.instagram)}</a>
          </div>
          <div><p class="footer-title">Kurumsal</p>
            <a href="bilgi.html#hakkimizda" class="footer-link">Hakkımızda</a>
            <a href="bilgi.html#teslimat" class="footer-link">Teslimat Koşulları</a>
            <a href="bilgi.html#mesafeli" class="footer-link">Mesafeli Satış Sözleşmesi</a>
            <a href="bilgi.html#iade" class="footer-link">İptal ve İade</a>
            <a href="bilgi.html#gizlilik" class="footer-link">Gizlilik Politikası</a>
            <a href="bilgi.html#bakim" class="footer-link">Çiçek Bakımı</a>
          </div>
          <div><p class="footer-title">Çiçekler</p>${cats.types.map((c) => `<a href="kategori.html?tur=${c.slug}" class="footer-link">${esc(c.name)}</a>`).join("")}<a href="kategori.html" class="footer-link">Tüm Çiçekler</a></div>
          <div><p class="footer-title">İletişim</p>
            <p class="leading-relaxed">${esc(S.address)}</p>
            <a href="tel:${S.phoneTel}" class="footer-link mt-3">${esc(S.phone)}</a>
            <a href="${waLink("Merhaba")}" target="_blank" rel="noopener" class="footer-link">WhatsApp Destek</a>
            ${S.email ? `<a href="mailto:${esc(S.email)}" class="footer-link">${esc(S.email)}</a>` : ""}
            ${S.hours ? `<p class="mt-2">${esc(S.hours)}</p>` : ""}
          </div>
        </div>
        <div class="border-t border-white/10">
          <div class="max-w-[1400px] mx-auto px-4 sm:px-8 py-6 flex flex-wrap gap-4 items-center justify-between text-[12px] text-white/55">
            <span>© ${y} ${esc(S.name)}. Tüm hakları saklıdır.</span>
            <div class="flex items-center gap-2">${["VISA", "Mastercard", "Troy", "Havale / EFT"].map((c) => `<span class="border border-white/25 px-2 py-1 text-[10px] tracking-wider">${c}</span>`).join("")}</div>
            <a href="admin.html" class="hover:text-white">Yönetim</a>
          </div>
        </div>
      </footer>
      <a href="${waLink("Merhaba, çiçek siparişi vermek istiyorum.")}" target="_blank" rel="noopener" class="fixed right-5 bottom-5 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-lg hover:scale-105 transition-transform" aria-label="WhatsApp'tan sipariş ver">${icon.wa.replace('width="20" height="20"', 'width="28" height="28"')}</a>`;
  }

  window.UI = { $, esc, money, param, slugify, waLink, art, productImage, productCard, bindAddButtons, Cart, toast, renderHeader, renderFooter, icon, mix };
  document.addEventListener("DOMContentLoaded", () => { renderHeader(); renderFooter(); });
})();
