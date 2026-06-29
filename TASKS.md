# 📋 Tasks · Ayıntap Balta Kılıç

> Format: `[ ]` bekliyor, `[x]` tamam, `[~]` devam ediyor, `[!]` blok / karar bekliyor

---

## ✅ Faz 1 — MVP / Aha Moment (TAMAM)

- [x] Next.js 15 App Router yapısı
- [x] Premium karanlık + altın tasarım sistemi (Cinzel + Inter)
- [x] Logo SVG bileşeni
- [x] MongoDB native driver + UUID id'ler
- [x] Auto-seed (categories, products, homepage_sections, admin user)
- [x] JWT + bcrypt auth, httpOnly cookie
- [x] Bootstrap super_admin user
- [x] Public + admin homepage_sections endpoint'leri (GET/POST/PUT/DELETE/reorder)
- [x] Site settings (single doc, key:main) GET + PUT
- [x] Products CRUD (admin) + public listing/detail
- [x] Categories listing (auto-seed)
- [x] Cloudinary upload endpoint + dataURL fallback
- [x] Orders POST endpoint + admin listing
- [x] Admin stats endpoint
- [x] Header (scroll-aware) + Footer + mobile menu
- [x] CartDrawer (slide-cart) ve sepet sayfası (Zustand persist)
- [x] Ürün detay sayfası (gallery, specs, kişiselleştirme)
- [x] Auth sayfaları (giriş/kayıt)
- [x] Admin panel:
  - [x] Dashboard (stats)
  - [x] Products CRUD (image upload + spec editor)
  - [x] Homepage Builder (drag up/down, aktif/pasif, tüm section editor'leri)
  - [x] Orders listing
  - [x] Site Settings paneli
- [x] WhatsApp floating button (settings.whatsapp varsa)
- [x] Dinamik CMS-driven anasayfa rendering
- [x] README, PROJECT_CONTEXT, TASKS, .env.example
- [x] Git repo ınit + .gitignore

---

## 🔨 Faz 2 — Kullanıcı Deneyimi & Sipariş Akışı

- [ ] Multi-step checkout sayfası (`/odeme`)
  - [ ] Adım 1: Teslimat adresi
  - [ ] Adım 2: Sipariş özeti
  - [ ] Adım 3: Ödeme yöntemi (iyzico/PayTR/kapıda)
- [ ] Adresler koleksiyonu + CRUD endpoint'leri
- [ ] Kullanıcı profil sayfası (`/profil`)
  - [ ] Profil düzenleme
  - [ ] Sipariş geçmişi
  - [ ] Favoriler
  - [ ] Adreslerim
  - [ ] Şifre değiştirme
- [ ] Favoriler sistemi (backend + UI heart icon)
- [ ] Kupon sistemi (model + admin CRUD + checkout uygulama)
- [ ] Mail doğrulama (token + UI)
- [ ] Şifre sıfırlama (token email flow)
- [ ] Yorum / puanlama sistemi UI (backend ekle + moderation panel)
- [ ] Admin: Kullanıcı yönetimi sekmesi

---

## 💳 Faz 3 — Ödeme + Kargo + Email

- [ ] **iyzico** gerçek entegrasyon (3D Secure, callback, webhook)
- [ ] **PayTR** gerçek entegrasyon
- [ ] Ödeme başarılı/başarısız dönüş sayfaları
- [ ] Sipariş durumu update sistemi (pending → paid → shipped → delivered)
- [ ] Kargo takip:
  - [ ] Admin'den takip kodu girme
  - [ ] Kullanıcı panelinde timeline gösterimi
  - [ ] Kargo firması yonlendırme linkleri
- [ ] Email sistemi:
  - [ ] Resend veya SMTP entegrasyonu
  - [ ] Sipariş onay maili template
  - [ ] Admin sipariş bildirim maili
  - [ ] Şifre sıfırlama maili

---

## 🌐 Faz 4 — Blog, SEO, KVKK, Çoklu Dil

- [ ] Blog sistemi
  - [ ] Model + admin CRUD (rich text editor)
  - [ ] `/blog` listesi + `/blog/[slug]` detay
  - [ ] Etiket + kategori
- [ ] SEO
  - [ ] Per-sayfa dynamic metadata (urunler, product detail, blog)
  - [ ] OpenGraph + Twitter card
  - [ ] Sitemap.xml (ürünler + blog dahil)
  - [ ] Robots.txt
  - [ ] JSON-LD product schema
- [ ] KVKK / Cookie consent banner
- [ ] Mesafeli satış sözleşmesi + iade politikası sayfaları (admin'den editable)
- [ ] Çoklu dil altyapı (`next-intl` veya benzeri)
- [ ] Analytics (Google Analytics + Meta Pixel inject from settings)

---

## 🔒 Faz 5 — Güvenlik + Performance + Polish

- [ ] Rate limiting (özellikle /auth/login)
- [ ] CSRF token sistemi
- [ ] Security headers (Helmet equivalent for Next.js middleware)
- [ ] Input sanitization (XSS)
- [ ] Image optimization (Next.js Image component'a geçiş)
- [ ] ISR / cache stratejileri
- [ ] Loading skeletons + error boundaries
- [ ] Empty states polish
- [ ] Lighthouse 90+ optimize
- [ ] Dark/Light mode toggle (default dark)
- [ ] Backup / restore admin tool

---

## 📢 Faz 6 — Marketing & Growth

- [ ] Pop-up sistemi (admin'den yönetilebilir)
- [ ] Duyuru barı (site üstü)
- [ ] Newsletter (Resend ile)
- [ ] Instagram feed entegrasyonu
- [ ] Canlı destek (Crisp/Tawk.to)
- [ ] Push notification (web push)

---

## 📌 Karar Bekleyen / Notlar

- [!] Cloudinary canlı anahtarlar (kullanıcı sağlayacak)
- [!] iyzico / PayTR test üyeliği (kullanıcı sağlayacak)
- [!] Resend veya SMTP tercihi (kullanıcı belirleyecek)
- [!] MongoDB Atlas cluster (kullanıcı oluşturup connection string verecek)
