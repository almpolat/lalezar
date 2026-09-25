// =============================================================
//  LALEZAR ÇİÇEKÇİLİK — SİTE AYARLARI
//  Dükkan bilgisi değişince sadece bu dosyayı düzenle.
// =============================================================
window.LALEZAR_CONFIG = {
  // "demo"     → ürünler bu tarayıcıda saklanır (kurulum gerekmez)
  // "firebase" → ürünler Firebase'de saklanır, herkes aynı veriyi görür
  mode: "demo",

  // mode "firebase" olduğunda Firebase konsolundan kopyalanan bilgiler
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  },

  // Sadece demo modunda admin girişi için kullanılır
  demoAdminPassword: "lalezar2026",

  shop: {
    name: "Lalezar Çiçekçilik",
    phone: "0 532 242 33 65",
    phoneTel: "+905322423365",
    whatsapp: "905322423365",
    address: "Bağdat Cad. 207/A, Çiftehavuzlar, 34730 Kadıköy/İstanbul",
    instagram: "lalezarflower",
    website: "https://www.lalezarcicekcilik.com/",
    email: "",   // varsa ekle, boşsa gösterilmez
    hours: "",   // örn: "Her gün 08.00 – 21.00" — boşsa gösterilmez
    mapsQuery: "Lalezar Çiçekçilik, Bağdat Caddesi 207/A, Çiftehavuzlar, Kadıköy, İstanbul"
  },

  delivery: {
    headline: "İstanbul içi aynı gün teslimat",
    cutoff: "",  // örn: "15.00" — girilirse "15.00'e kadar verilen siparişler" yazar
    slots: ["10.00 – 13.00", "13.00 – 16.00", "16.00 – 19.00", "19.00 – 21.00"],
    fee: 0       // 0 ise "Ücretsiz" yazar
  }
};
