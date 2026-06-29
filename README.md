<div align="center">

# ⚔️ Ayıntap Balta Kılıç · E-Ticaret Sistemi

**Örsün üzerinde dövülen ataların mirası. Çeliğe can veren gelenek.**

Production-ready, dinamik CMS tabanlı, premium karanlık temalı Next.js 15 e-ticaret platformu.

</div>

---

## 🔥 Özellikler

### Ürün / Satış Sistemi
- Tam dinamik **ürün CRUD** sistemi (çoklu görsel, SKU, stok, varyant, teknik özellikler)
- **Lazerle isim yazdırma** kişiselleştirme sistemi (+ücretli)
- **Kategori sistemi** (Alp Pusatları, Osmanlı, Selçuklu, Göktürk vb.)
- Modern **slide-cart** ve sepet sayfası (Zustand persist)
- Ürün detay sayfası (galeri, teknik spec tablosu, rating, stok kontrolü)

### CMS / Homepage Builder
- **Homepage Builder**: drag-up/down sectıon sistemi, aktif/pasif toggle, dinamik düzen
- Section tipleri: Hero Slider, Öne Çıkanlar, Koleksiyonlar, Hikayemiz, Yorumlar, SSS, Newsletter
- Tüm içerikler **MongoDB**'den render edilir (hardcoded değil)
- **Site Ayarları**: marka, iletişim, sosyal medya, SEO, analytics tek panelden yönetilebilir

### Auth & Güvenlik
- **JWT + bcrypt** auth, HTTP-only cookie
- Rol sistemi: `super_admin`, `admin`, `editor`, `customer`
- Korunan admin endpoint'leri

### Tasarım
- Mat siyah `#0d0d0d` + kömür grisi `#161616` + eskitme altın `#d4af37`
- **Cinzel** serif başlık font, Inter gövde
- **Framer Motion** ile sinematik geçişler
- %100 responsive, mobile-first

### Entegrasyon Altyapısı (hazır ama opsiyonel anahtar)
- **Cloudinary** — gerçek upload (anahtar yoksa data URL fallback)
- **iyzico / PayTR** — ödeme aktıcılar test/mock modunda
- **Resend / SMTP** — email modu (şimdilik mock)

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 20+
- Yarn 1.22+ (npm KULLANMAYIN, breaking changes)
- MongoDB Atlas hesabı (veya local Mongo 7+)

### Kurulum

```bash
# 1) Klonla
git clone <repo-url>
cd ayintap-balta-kilic

# 2) Bağımlılıklar
yarn install

# 3) .env hazırla
cp .env.example .env
# .env içindeki MONGO_URL, JWT_SECRET ve diğerleri doldur

# 4) Geliştirme sunucusunu başlat
yarn dev
```

Uygulama `http://localhost:3000` adresinde açılır. **İlk istekte** otomatik seed çalışır ve bütün demo veri (kategoriler, ürünler, homepage section'ları, admin kullanıcı) eklenir.

### Varsayılan Admin Girişi

| Alan | Değer |
|------|-------|
| E-posta | `admin@ayintap.com` |
| Şifre | `Ayintap2025!` |
| Panel | `/admin` |

> ⚠️ Production'da `ADMIN_BOOTSTRAP_EMAIL`/`ADMIN_BOOTSTRAP_PASSWORD` ve `JWT_SECRET` ortam değişkenlerini değiştirin.

---

## 📁 Proje Yapısı

```
/app
├── app/
│   ├── api/[[...path]]/route.js  # Tüm backend (catch-all)
│   ├── page.js                   # Anasayfa (server-rendered, CMS-driven)
│   ├── layout.js                 # Root layout (Cinzel + Inter font)
│   ├── globals.css
│   ├── admin/                    # Admin paneli
│   ├── urunler/                  # Ürün listesi + detay
│   ├── sepet/                    # Sepet sayfası
│   ├── giris/  kayit/            # Auth sayfaları
├── components/
│   ├── Logo.js                   # SVG logo
│   ├── Header.js / Footer.js
│   ├── CartDrawer.js
│   └── HomepageRenderer.js       # Dinamik section renderer
├── lib/
│   ├── mongodb.js                # Connection pool
│   ├── auth.js                   # JWT + bcrypt + getCurrentUser
│   ├── cloudinary.js             # Upload with fallback
│   ├── seed.js                   # Auto-seed on first request
│   └── store.js                  # Zustand cart + auth
├── .env.example
├── PROJECT_CONTEXT.md            # 📖 Tam proje context'i (handoff için)
├── TASKS.md                      # 📋 Faz ve görev takibi
└── README.md
```

---

## 🔌 Ortam Değişkenleri

Tüm değişkenler `.env.example` içinde dokümante edilmiştir:

```env
# Veritabanı (zorunlu)
MONGO_URL=mongodb+srv://USER:PASS@cluster.mongodb.net
DB_NAME=ayintap_balta_kilic

# Auth (zorunlu)
JWT_SECRET=use_a_long_random_string_in_prod

# Bootstrap admin
ADMIN_BOOTSTRAP_EMAIL=admin@ayintap.com
ADMIN_BOOTSTRAP_PASSWORD=Ayintap2025!

# Cloudinary (opsiyonel, yoksa data URL fallback)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Ödeme (opsiyonel, mock mod çalışmaya devam eder)
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
PAYTR_MERCHANT_ID=
PAYTR_MERCHANT_KEY=
PAYTR_MERCHANT_SALT=

# Email (opsiyonel)
RESEND_API_KEY=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

---

## 📦 Vercel Deploy

```bash
# Vercel CLI
npm i -g vercel
vercel

# Veya GitHub'a push edip vercel.com'dan import et
```

Vercel dashboard üzerinden tüm `.env` değişkenlerini ekleyin. Build komutu otomatik (`next build`).

---

## 📝 Lisans

© Ayıntap Balta Kılıç · Tüm hakları saklıdır.

---

## 📞 İletişim

- 📞 +90 505 547 94 42
- ✉️ ayintapsword@gmail.com
- 📍 Güneş Mahallesi 79012 Sokak No 9 Şahinbey / Gaziantep
