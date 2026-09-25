// Tailwind renk ve font ayarları (tüm sayfalar ortak kullanır)
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: "#1E1E1E",     // yazı ve koyu alanlar
        line: "#E6E3DE",    // ince çizgiler
        mist: "#F5F3EF",    // görsel arka planı
        orange: "#E8850A",  // logodaki turuncu (indirim, vurgu)
        lime: "#C2D10A",    // logodaki yeşil
        limesoft: "#F5F3EF", // eski isimler (admin/sepet uyumu)
        petal: "#F7EFE6"
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["Jost", "system-ui", "-apple-system", "Segoe UI", "sans-serif"]
      }
    }
  }
};
