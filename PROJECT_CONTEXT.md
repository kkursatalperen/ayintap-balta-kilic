# 📖 Project Context · Ayıntap Balta Kılıç

> Bu dosya, projeyi **başka bir hesaptan / workspace'ten** veya **farklı bir LLM agent** ile kaldığı yerden devam ettirebilmek için tüm context'i içerir.
>
> **HER ÖNEMLİ KARAR VE DURUM DEĞİŞİKLİĞİ BU DOSYAYA YAZILMALIDIR.**

---

## 1. Ürün Vizyonu

**Ayıntap Balta Kılıç**, Gaziantep'in eski adı olan "Ayıntap" topraklarında dededen toruna aktarılan demirci geleneğini temsil eden bir el yapımı kılıç / balta / koleksiyon eserleri markasıdır.

**Marka karakteri:** premium, destansı, maskülen, karanlık, asil.

**Hedef:** Sahte demo değil, gerçek kullanıcılar, gerçek siparişler, gerçek veritabanı işlemleri ile çalışan, production deployment'a hazır tam kapsamlı e-ticaret platformu.

---

## 2. Teknoloji Yapısı (Karar Verilen)

| Katman | Teknoloji | Karar Nedeni |
|--------|-----------|--------------|
| Frontend | Next.js 15 (App Router) | Problem statement zorunluluğu |
| Dil | JavaScript (JS) | Mevcut template JS, MVP hızı için TS'e geçilmedi. Type-safety Zod ile sağlanıyor. |
| Styling | TailwindCSS + shadcn/ui | Template hazır |
| Animasyon | Framer Motion | Sinematik geçişler |
| Backend | Next.js API Routes (catch-all `[[...path]]`) | Tek dosyada hepsi (template gereği) |
| Veritabanı | MongoDB (Mongoose ve native driver kurulu, **şu an native driver kullanılıyor**) | Hız için native + UUID id'ler |
| Auth | JWT + bcryptjs, HTTP-only cookie | Güvenli |
| State | Zustand (persist) | Sepet + auth |
| Form | React Hook Form + Zod (kurulu, kullanılacak) | Validation |
| Upload | Cloudinary (fallback: data URL) | Production-ready |
| Ödeme | iyzico + PayTR (mock alt yapı) | Anahtar gelince canlı |
| Email | Resend / SMTP (mock) | Anahtar gelince canlı |
| Toast | sonner | Template hazır |

### Tasarım Sistemi
- **Renkler:** Mat Siyah `#0d0d0d`, Kömür Grisi `#161616`, Eskitme Altın `#d4af37`
- **Font:** Cinzel (serif, başlıklar) + Inter (gövde) — Google Fonts
- **İkonlar:** lucide-react

---

## 3. Mevcut Durum (Snapshot)

### ✅ Tamamlanan (Faz 1)
- Logo SVG bileşeni (`components/Logo.js`) — antik kalkan + kartal + kılıç + çapraz baltalar
- Header (scroll-aware), Footer, CartDrawer, mobile menu
- Dinamik CMS sistem (`homepage_sections` koleksiyonu)
- Homepage Builder admin paneli (drag up/down, aktif/pasif, tüm section'lar için editor)
- Site Ayarları paneli (marka, iletişim, sosyal, SEO, analytics)
- Ürün CRUD admin (görsel yükleme, teknik spec, kişiselleştirme)
- Auth (register/login/me/logout, JWT, httpOnly cookie)
- Ayar/yetki: super_admin > admin > editor > customer
- Ürün listesi + detay sayfası (gallery, spec table, kişiselleştirme seçeneği)
- Sepet sayfası + slide-cart (Zustand persist)
- Sipariş oluşturma endpoint'i (şimdilik pending_payment)
- Cloudinary upload (anahtar yoksa data URL dönüyor)
- Otomatik seed (categories, products, sections, admin)
- Premium siyah/altın karanlık tema, Framer Motion animasyonlar

### ⏳ Bekleyen / Eksik
- **Ödeme entegrasyonu (Faz 3):** iyzico + PayTR gerçek SDK entegrasyonu, 3D Secure, webhook
- **Kargo takip sistemi (Faz 3):** takip kodu, timeline, kargo firması linkleri
- **Email sistemi (Faz 3):** Resend/SMTP entegrasyonu, sipariş mailleri, şifre sıfırlama
- **Blog sistemi (Faz 4):** rich metadata, etiket, kategori
- **SEO:** dynamic metadata per sayfa, sitemap.xml, robots.txt
- **KVKK / Cookie consent / mesafeli satış sayfaları**
- **Çoklu dil altyapısı** (next-intl)
- **Kullanıcı paneli** (profil, sipariş geçmişi, favoriler, adresler) — backend hazır, UI eksik
- **Yorum / puanlama sistemi UI** (backend kolay ekleme)
- **Kupon sistemi** (modeli planlandı, UI yok)
- **Şifre sıfırlama email + reset flow**
- **CSRF / Rate limiting / Helmet headers** (production setup)

---

## 4. Veritabanı Şeması (MongoDB)

Tüm koleksiyonlar **UUID** (`id`) kullanır, Mongo `_id` projeksiyon ile gizlenir.

### `site_settings` (key="main" tek doküman)
```js
{ id, key:'main', brandName, tagline, contactPhone, contactEmail, contactAddress,
  whatsapp, social:{instagram,facebook,youtube,twitter}, seo:{title,description,keywords},
  analytics:{googleAnalytics, metaPixel}, maintenanceMode, footerAbout, createdAt, updatedAt }
```

### `categories`
```js
{ id, name, slug, image, order, isActive, createdAt }
```

### `products`
```js
{ id, name, slug, categoryId, price, oldPrice, discount, images:[url],
  description, sku, stock, specs:{key:value}, isFeatured, isBestseller, isNew,
  isActive, personalizable, personalizationPrice, rating, reviewCount, createdAt, updatedAt }
```

### `homepage_sections`
```js
{ id, type, order, isActive, data:{...}, createdAt, updatedAt }
// types: hero_slider, featured_products, collections, story, testimonials, newsletter, faq
```

### `users`
```js
{ id, email, name, phone, passwordHash, role, isActive, createdAt }
// roles: super_admin | admin | editor | customer
```

### `orders`
```js
{ id, orderNumber, userId, customer, items:[{id,name,qty,price,personalization}],
  subtotal, shipping, total, status, paymentMethod, paymentStatus,
  shippingAddress, trackingCode, createdAt }
```

### İleride eklenecek koleksiyonlar
- `banners`, `coupons`, `blogs`, `notifications`, `favorites`, `reviews`, `addresses`, `announcements`

---

## 5. API Endpoint Listesi

Tüm endpoint'ler `/api/...` prefix'i ile `app/api/[[...path]]/route.js` içindedir.

### Auth
| Method | Path | Auth | Notlar |
|--------|------|------|--------|
| POST | `/api/auth/register` | Public | email, password, name, phone |
| POST | `/api/auth/login` | Public | E-posta + şifre, httpOnly cookie set |
| POST | `/api/auth/logout` | Public | Cookie temizler |
| GET | `/api/auth/me` | Public | Cookie veya Bearer token üzerinden |

### Site Settings
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/settings` | Public |
| PUT | `/api/settings` | Admin |

### Homepage (CMS)
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/homepage` | Public, enriched products |
| GET | `/api/admin/homepage` | Admin |
| POST | `/api/admin/homepage` | Admin |
| PUT | `/api/admin/homepage/:id` | Admin |
| DELETE | `/api/admin/homepage/:id` | Admin |
| POST | `/api/admin/homepage/reorder` | Admin |

### Products / Categories
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/categories` | Public |
| GET | `/api/products?kategori=&q=` | Public |
| GET | `/api/products/:slug` | Public |
| GET/POST/PUT/DELETE | `/api/admin/products[/:id]` | Admin |

### Upload / Orders / Stats
| Method | Path | Auth |
|--------|------|------|
| POST | `/api/upload` | Admin |
| POST | `/api/orders` | Public (user opt) |
| GET | `/api/admin/orders` | Admin |
| GET | `/api/admin/stats` | Admin |

---

## 6. Ortam Değişkenleri

Kritik (production'da mutlaka set):
- `MONGO_URL`
- `DB_NAME`
- `JWT_SECRET` (uzun random string)
- `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD`
- `NEXT_PUBLIC_BASE_URL`

Entegrasyonlar (opsiyonel, gelince doldur):
- `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET`
- `IYZICO_API_KEY` / `_SECRET_KEY` / `_BASE_URL`
- `PAYTR_MERCHANT_ID` / `_KEY` / `_SALT`
- `RESEND_API_KEY` veya `SMTP_*`

> `.env.example` referans olarak bu dosyaların hepsini içerir.

---

## 7. Önemli Mimari Kararlar

1. **Catch-all backend (`[[...path]]/route.js`):** Template gereği. Tüm endpoint'ler tek dosyada path-based switching ile. İleride bölerek refactor edilebilir ama Next.js Edge runtime farklılıklarına dikkat.

2. **Mongoose vs Native Driver:** Native driver kullanılıyor (UUID, basit query'ler için yeterli). Mongoose paketi yüklendi, ileride model isteniçşe geçişe hazır.

3. **Auto-seed:** Her API isteğinde `ensureSeed()` çağrılır; `site_settings` koleksiyonunda `key:"main"` yoksa tüm seed atar. **Production'da bir kez çalışır.**

4. **Cloudinary fallback:** Env değişkenleri yoksa upload endpoint dataURL'i `url` olarak döner. UI böylece anahtar olmadan da çalışır.

5. **CMS-driven homepage:** Anasayfa'da hiçbir içerik hardcoded değil. Yeni section tipi eklemek için:
   - `lib/seed.js`'e default veri
   - `components/HomepageRenderer.js`'e renderer
   - `app/admin/AdminApp.js`'e editor case
   - `SECTION_TYPES`'a entry

6. **Bootstrap admin:** İlk seed'de `.env`'deki credentials ile super_admin yaratılır.

---

## 8. Faz Planlaması (Kullanıcı Kararı)

- **Faz 1 (✅ Tamamlandı):** CMS, Homepage Builder, admin altyapısı, MongoDB, Cloudinary altyapısı, premium responsive tasarım, ürün CRUD, auth
- **Faz 2:** Checkout (multi-step), kullanıcı paneli, favoriler, sipariş geçmişi, adres yönetimi
- **Faz 3:** Gerçek iyzico/PayTR (3D Secure), kargo takip, Resend email
- **Faz 4:** Blog, SEO (sitemap, metadata), analytics, KVKK, çoklu dil

---

## 9. Test / Default Credentials

```
Admin
  E-posta: admin@ayintap.com
  Şifre:  Ayintap2025!
  Panel:  /admin
```

Tüm değişkenler `.env`'den okunur.

---

## 10. Bilinen Konular / Notlar

- Next.js 15 dev sunucusu cross-origin uyarısı veriyor (preview ortamı sebebiyle, production'da yok)
- Cloudinary anahtarı olmadığı için upload şu an dataURL dönüyor (MongoDB'de URL olarak saklanıyor ama base64). **Production'da Cloudinary anahtarı girilmeli.**
- Sepet `localStorage` persist (zustand persist). Sunucu tarafı sepet senkronizasyonu yok (gerekirse eklenir).
- `test_result.md` git'e dahil edilmez (`.gitignore`).

---

## 11. Devam Talimatı (Handoff)

Eğer başka bir agent / hesap bu projeyi devralırsa:

1. `README.md` ile setup'ı yap (`.env.example` → `.env` doldur)
2. `yarn install && yarn dev`
3. `TASKS.md` üzerinden bir sonraki görevi seç
4. Bu dosyayı (`PROJECT_CONTEXT.md`) güncelle ve commit at
5. Faz sırasını koru: önce Faz 2, sonra 3, sonra 4

Tüm context burada. Mevcut önemli kararlar, eksikler, ve mimari notlar bu dosyada yaşatılır.
