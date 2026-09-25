// =============================================================
//  VERİ KATMANI
//  Site ürünleri, kategorileri ve siparişleri sadece buradan okur/yazar.
//  config.js içindeki mode ile demo (localStorage) ya da Firebase seçilir.
// =============================================================
(function () {
  const CFG = window.LALEZAR_CONFIG;
  const SEED = window.LALEZAR_SEED;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const newId = () => "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // ---------------- DEMO (localStorage) ----------------
  const K = { products: "lz_products", cats: "lz_categories", orders: "lz_orders", admin: "lz_admin" };
  const ls = {
    get(k, fallback) {
      try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); return true; }
      catch (e) { alert("Tarayıcı depolama alanı doldu. Daha küçük bir fotoğraf deneyin."); return false; }
    }
  };

  const demo = {
    async init() {
      // Katalog sürümü değişince eski demo verisi yenilenir
      if (ls.get("lz_seed_v") !== 3) { ls.set(K.products, clone(SEED.products)); ls.set(K.cats, clone(SEED.categories)); ls.set("lz_seed_v", 3); }
      if (!ls.get(K.products)) ls.set(K.products, clone(SEED.products));
      if (!ls.get(K.cats)) ls.set(K.cats, clone(SEED.categories));
    },
    async listProducts() { return ls.get(K.products, []); },
    async getProduct(id) { return (ls.get(K.products, [])).find((p) => p.id === id) || null; },
    async saveProduct(p) {
      const list = ls.get(K.products, []);
      if (!p.id) { p.id = newId(); p.createdAt = Date.now(); list.unshift(p); }
      else { const i = list.findIndex((x) => x.id === p.id); if (i >= 0) list[i] = p; else list.unshift(p); }
      ls.set(K.products, list); return p;
    },
    async deleteProduct(id) { ls.set(K.products, ls.get(K.products, []).filter((p) => p.id !== id)); },
    async getCategories() { return ls.get(K.cats, clone(SEED.categories)); },
    async saveCategories(c) { ls.set(K.cats, c); },
    async addOrder(o) {
      const list = ls.get(K.orders, []);
      o.id = "LZ" + Date.now().toString().slice(-6); o.createdAt = Date.now(); o.status = "Yeni";
      list.unshift(o); ls.set(K.orders, list); return o;
    },
    async listOrders() { return ls.get(K.orders, []); },
    async updateOrder(id, patch) {
      const list = ls.get(K.orders, []); const o = list.find((x) => x.id === id);
      if (o) Object.assign(o, patch); ls.set(K.orders, list);
    },
    async login(_email, password) {
      if (password === CFG.demoAdminPassword) { sessionStorage.setItem(K.admin, "1"); return true; }
      throw new Error("Şifre hatalı.");
    },
    async logout() { sessionStorage.removeItem(K.admin); },
    async isAdmin() { return sessionStorage.getItem(K.admin) === "1"; },
    async loadSeed() { ls.set(K.products, clone(SEED.products)); ls.set(K.cats, clone(SEED.categories)); }
  };

  // ---------------- FIREBASE ----------------
  let db, auth;
  const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
  const loadScript = (src) => new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });

  const firebaseStore = {
    async init() {
      await loadScript(FB + "firebase-app-compat.js");
      await loadScript(FB + "firebase-firestore-compat.js");
      await loadScript(FB + "firebase-auth-compat.js");
      firebase.initializeApp(CFG.firebase);
      db = firebase.firestore(); auth = firebase.auth();
      await new Promise((r) => { const u = auth.onAuthStateChanged(() => { u(); r(); }); });
    },
    async listProducts() {
      const snap = await db.collection("products").get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    },
    async getProduct(id) { const d = await db.collection("products").doc(id).get(); return d.exists ? { id: d.id, ...d.data() } : null; },
    async saveProduct(p) {
      const data = clone(p); const id = data.id || newId(); delete data.id;
      if (!data.createdAt) data.createdAt = Date.now();
      await db.collection("products").doc(id).set(data); return { ...data, id };
    },
    async deleteProduct(id) { await db.collection("products").doc(id).delete(); },
    async getCategories() {
      const d = await db.collection("settings").doc("categories").get();
      return d.exists ? d.data() : clone(SEED.categories);
    },
    async saveCategories(c) { await db.collection("settings").doc("categories").set(c); },
    async addOrder(o) {
      o.id = "LZ" + Date.now().toString().slice(-6); o.createdAt = Date.now(); o.status = "Yeni";
      await db.collection("orders").doc(o.id).set(o); return o;
    },
    async listOrders() {
      const snap = await db.collection("orders").orderBy("createdAt", "desc").get();
      return snap.docs.map((d) => d.data());
    },
    async updateOrder(id, patch) { await db.collection("orders").doc(id).update(patch); },
    async login(email, password) {
      try { await auth.signInWithEmailAndPassword(email, password); return true; }
      catch (e) { throw new Error("E-posta veya şifre hatalı."); }
    },
    async logout() { await auth.signOut(); },
    async isAdmin() { return !!auth.currentUser; },
    async loadSeed() {
      const batch = db.batch();
      SEED.products.forEach((p) => { const d = clone(p); const id = d.id; delete d.id; d.createdAt = Date.now(); batch.set(db.collection("products").doc(id), d); });
      batch.set(db.collection("settings").doc("categories"), clone(SEED.categories));
      await batch.commit();
    }
  };

  const impl = CFG.mode === "firebase" ? firebaseStore : demo;
  let ready = null;
  window.Store = new Proxy(impl, {
    get(target, prop) {
      if (prop === "mode") return CFG.mode;
      if (prop === "ready") return () => (ready = ready || target.init());
      const fn = target[prop];
      if (typeof fn !== "function") return fn;
      return async (...args) => { await (ready = ready || target.init()); return fn.apply(target, args); };
    }
  });
})();
