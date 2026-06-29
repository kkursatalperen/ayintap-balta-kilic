# 🚀 Vercel Deployment Guide · Ayıntap Balta Kılıç

Bu dosya projeyi Vercel'e production'a deploy etmek için adım-adım rehberdir.

---

## ✅ Deployment Hazırlık Kontrolü

| Madde | Durum |
|-------|------|
| Production build başarılı (`yarn build`) | ✅ 18 sayfa hatasız generate |
| Tüm URL'ler env'den okunuyor | ✅ Hardcoded yok |
| Secrets `.env`'de, kod yok | ✅ `.gitignore` koruyor |
| MongoDB native driver pool'lu | ✅ `lib/mongodb.js` cached |
| Catch-all `/api/[[...path]]/route.js` | ✅ Tüm endpoint'ler tek route |
| `next.config.js` Vercel uyumlu | ✅ |
| Static + dynamic page mix | ✅ ISR ready |
| API queries `.limit()` ile | ✅ Performance optimize |
| Backend tested (42/42 pass) | ✅ |

---

## 📋 Adım 1 — Vercel Projesini Oluştur

### Yöntem A: GitHub Bağlı (Önerilen)

1. https://vercel.com/new → "Import Git Repository"
2. GitHub hesabını bağla (kkursatalperen)
3. `ayintap-balta-kilic` reposunu seç
4. Framework: **Next.js** (otomatik algılanır)
5. Root Directory: `./` (varsayılan)
6. Build Command: `next build` (varsayılan)
7. Install Command: `yarn install` (varsayılan)
8. "Deploy" demeden **ÖNCE** Environment Variables'ı doldur (Adım 2)

### Yöntem B: Vercel CLI

```bash
npm i -g vercel
cd /app
vercel login
vercel
# İlk deploy'da soracak: link to existing project? N → yeni proje oluştur
```

---

## 🔐 Adım 2 — Environment Variables (KRİTİK)

Vercel Dashboard → Project Settings → Environment Variables → tek tek ekle veya CSV import:

### Zorunlu

| Variable | Örnek Değer | Açıklama |
|----------|-------------|----------|
| `MONGO_URL` | `mongodb+srv://user:pass@cluster.mongodb.net` | MongoDB Atlas connection string |
| `DB_NAME` | `ayintap_balta_kilic` | Veritabanı adı |
| `JWT_SECRET` | (64+ karakter random) | JWT imzası — değiştir! |
| `NEXT_PUBLIC_BASE_URL` | `https://ayintapbaltakilic.com` | Production domain |
| `ADMIN_BOOTSTRAP_EMAIL` | `admin@ayintap.com` | İlk admin |
| `ADMIN_BOOTSTRAP_PASSWORD` | (güçlü şifre) | İlk admin şifresi — değiştir! |

### Opsiyonel (Entegrasyon Aktifleştirme)

| Variable | Boş Bırakılırsa | Doldurulduğunda |
|----------|-----------------|-----------------|
| `CLOUDINARY_CLOUD_NAME` | dataURL fallback | Gerçek upload |
| `CLOUDINARY_API_KEY` | - | - |
| `CLOUDINARY_API_SECRET` | - | - |
| `IYZICO_API_KEY` | Test mode | Canlı 3D Secure ödeme |
| `IYZICO_SECRET_KEY` | - | - |
| `IYZICO_BASE_URL` | `https://sandbox-api.iyzipay.com` | `https://api.iyzipay.com` (prod) |
| `PAYTR_MERCHANT_ID` | Test mode | Canlı PayTR ödeme |
| `PAYTR_MERCHANT_KEY` | - | - |
| `PAYTR_MERCHANT_SALT` | - | - |
| `RESEND_API_KEY` | Console log mock | Gerçek email gönderimi |
| `SMTP_HOST` | - | SMTP alternative |
| `SMTP_PORT` | `587` | - |
| `SMTP_USER` | - | - |
| `SMTP_PASS` | - | - |

### Vercel CLI ile toplu ekleme

```bash
# .env.production dosyası hazırla
cat > /tmp/.env.production << 'EOF'
MONGO_URL=mongodb+srv://...
DB_NAME=ayintap_balta_kilic
JWT_SECRET=...
EOF

# Vercel'e push
vercel env pull
# veya tek tek:
vercel env add MONGO_URL production
```

---

## 🗄️ Adım 3 — MongoDB Atlas Kurulum

1. https://cloud.mongodb.com → "New Project"
2. Free M0 Cluster oluştur (production için M10+)
3. Database Access → yeni user (örn: `ayintap_admin`)
4. Network Access → **0.0.0.0/0** ekle (Vercel IP'leri için)
5. Connect → "Connect your application" → Connection string'i kopyala
6. `<password>`'ü gerçek şifreyle değiştir
7. Bu string'i `MONGO_URL` env değişkeni olarak Vercel'e ekle

⚠️ **Production tavsiyeleri:**
- M10+ cluster (auto-scale)
- IP whitelist: sadece Vercel'in CIDR'larını ekle
- Backup açık tut
- Read replica setup'la

---

## 🚀 Adım 4 — Deploy

### GitHub Bağlı ise

Her `git push origin main` Vercel'i tetikler. İlk push:

```bash
cd /app
git push origin main
```

Build durumunu Vercel Dashboard → Deployments'tan izle.

### CLI ile

```bash
vercel --prod
```

---

## 🔍 Adım 5 — Post-Deploy Doğrulama

Site canlıya çıkınca **mutlaka** test et:

### Smoke Test
```bash
# Replace with your domain
DOMAIN=https://ayintapbaltakilic.com

# Health check
curl $DOMAIN/api

# Public endpoints
curl $DOMAIN/api/products | head -c 200
curl $DOMAIN/api/homepage | head -c 200
curl $DOMAIN/sitemap.xml | head -c 200
curl $DOMAIN/robots.txt

# Auto-seed (ilk istekten sonra db dolar)
curl $DOMAIN/api/settings
```

### Admin İlk Giriş

1. `https://yourdomain.com/giris`
2. Email: `ADMIN_BOOTSTRAP_EMAIL` değerin
3. Şifre: `ADMIN_BOOTSTRAP_PASSWORD` değerin
4. ⚠️ İlk girişte profilden şifreni hemen değiştir!

---

## 🌐 Adım 6 — Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. `ayintapbaltakilic.com` ekle
3. DNS sağlayıcında (örn: GoDaddy, Namecheap):
   - `A` record → `76.76.21.21`
   - `CNAME` (www) → `cname.vercel-dns.com`
4. SSL otomatik (Let's Encrypt)

`NEXT_PUBLIC_BASE_URL` env değişkenini **yeni domaine** güncelle, redeploy.

---

## 📊 Adım 7 — Analytics & Monitoring

### Vercel Analytics (Built-in)

```bash
yarn add @vercel/analytics
```

`/app/app/layout.js` içinde `<Analytics/>` ekle. Vercel Dashboard'tan aktifleştir.

### Hata İzleme (Önerilen)

- **Sentry** (`@sentry/nextjs`)
- **LogRocket**
- **Datadog**

---

## 🔄 CI/CD Akışı

```
git push origin main
   ↓
Vercel webhook tetiklenir
   ↓
Build (yarn install + next build)
   ↓
Lambda functions deploy
   ↓
Static assets → CDN
   ↓
Production URL otomatik güncellenir
```

Preview deployments her PR'de otomatik oluşur.

---

## ⚠️ Production Sertleştirme Öncelikleri

Deploy sonrası mutlaka yap:

- [ ] `JWT_SECRET`'ı 64+ karakter random ile değiştir
- [ ] `ADMIN_BOOTSTRAP_PASSWORD`'u güçlü şifreyle değiştir, ilk girişte tekrar değiştir
- [ ] MongoDB Atlas IP whitelist'i Vercel CIDR'larına daralt
- [ ] Cloudinary API anahtarlarını ekle (görseller için)
- [ ] Rate limiting middleware ekle (Vercel Edge Middleware ile)
- [ ] CSRF token sistemi (sonraki faz)
- [ ] Security headers (Helmet equivalent) middleware
- [ ] Sentry / log monitoring ekle
- [ ] Custom domain + SSL
- [ ] Google Search Console'a `sitemap.xml` ekle

---

## 🐛 Sorun Giderme

### Build Fail

```bash
# Vercel logs
vercel logs --follow

# Lokal test
yarn build
```

En sık görülen hatalar:
- Eksik env var → "Missing required environment variable"
- `MONGO_URL` yanlış format → Atlas connection error
- Node version uyumsuzluk → `engines` field'ı `package.json`'a ekle

### "MongoServerError: bad auth" 

Atlas password'da özel karakter varsa URL-encode et:
```
mongodb+srv://user:P%40ssw0rd@cluster.mongodb.net  ← @ = %40
```

### Auto-seed çalışmıyor

İlk request'te seed atar. Aşağıdakini bir kez çağır:
```bash
curl https://yourdomain.com/api/settings
```

---

## 📞 Destek

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/app/building-your-application/deploying
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

---

**Deploy hazır! Push edip canlıya çıkabilirsin.** ⚔️🔨
