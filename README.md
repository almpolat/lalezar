# Lalezar Çiçekçilik — Demo Site

HTML + Tailwind + vanilla JS. GitHub Pages'te çalışır, derleme gerekmez.

## Dosyalar
| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Ana sayfa |
| `kategori.html` | Liste (`?tur=buket`, `?sebep=dogum-gunu`, `?q=gül`) |
| `urun.html?id=...` | Ürün detayı |
| `sepet.html` | Sepet + sipariş formu + WhatsApp onayı |
| `bilgi.html` | Kurumsal sayfalar (hakkımızda, teslimat, iade, gizlilik, bakım) |
| `admin.html` | Yönetim paneli (çiçek, fiyat, fotoğraf, kategori, sipariş) |
| `js/config.js` | **Dükkan bilgileri ve mod ayarı** |
| `js/store.js` | Veri katmanı (demo / firebase) |
| `js/seed.js` | 18 örnek çiçek + kategoriler |
| `js/ui.js` | Ortak menü, footer, ürün kartı, sepet, illüstrasyonlar |

## Fotoğraflar
Örnek ürün ve slider fotoğrafları Unsplash'ten (ücretsiz, ticari kullanıma açık). Dükkânın kendi fotoğrafları çekilince admin panelinden her ürünün fotoğrafı değiştirilir. Slider görselleri `js/seed.js` → `heroSlides` içinde.

## 1. Demo olarak yayınla
1. Klasörü bir GitHub reposuna pushla
2. Settings → Pages → Branch: `main` / root → Save
3. Admin: `/admin.html`, şifre `js/config.js` içindeki `demoAdminPassword`

Demo modunda admin değişiklikleri sadece o tarayıcıda görünür. Göstermek için idealdir.

## 2. Gerçeğe geçiş (Firebase, ücretsiz Spark planı)
1. https://console.firebase.google.com → Proje oluştur
2. **Build → Firestore Database** → Create database (production mode, bölge: eur3)
3. **Build → Authentication** → Email/Password'ü aç → Users → dükkan için bir kullanıcı ekle
4. **Proje ayarları → Genel → Web uygulaması ekle** → çıkan `firebaseConfig` değerlerini `js/config.js` → `firebase` alanına yapıştır
5. `js/config.js` içinde `mode: "firebase"` yap
6. **Firestore → Rules** sekmesine aşağıdakini yapıştır → Publish
7. Siteyi aç → `/admin.html` → e-posta/şifre ile gir → Ayarlar → **Örnek çiçekleri yükle**
8. Authentication → Settings → Authorized domains'e GitHub Pages / alan adını ekle

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /products/{id}  { allow read: if true; allow write: if request.auth != null; }
    match /settings/{id}  { allow read: if true; allow write: if request.auth != null; }
    match /orders/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

Fotoğraflar yüklenirken 1000px'e küçültülüp ürünün içine kaydedilir; ayrı depolama kurulumu gerekmez.

## Sonra eklenebilecekler
- Online ödeme (iyzico / PayTR)
- Yeni siparişte e-posta/WhatsApp bildirimi
- Mesafeli satış sözleşmesi, KVKK sayfaları
- lalezarcicekcilik.com alan adını bağlama
