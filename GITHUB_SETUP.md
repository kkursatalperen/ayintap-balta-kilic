# 🐙 GitHub Bağlantı Rehberi

Bu dosya projeyi GitHub'a bağlamak ve **başka hesap / başka workspace** üzerinden geliştirmeye devam edebilmek için adım-adım talimatları içerir.

---

## 1. GitHub'da Repository Oluştur

1. [github.com/new](https://github.com/new) adresine git
2. Repository name: `ayintap-balta-kilic` (veya istediğin isim)
3. **Private** seç (e-ticaret için tavsiye edilen)
4. **README, .gitignore, license ekleme** — boş olsun, biz kendi dosyalarımızı pushlayacağız
5. "Create repository" butonuna bas

Açılan sayfada GitHub sana komutları gösterecek. Onları kullanmıyoruz, aşağıdakini izle.

---

## 2. SSH Key veya Personal Access Token Hazırla

### Seçenek A — Personal Access Token (kolay)

1. https://github.com/settings/tokens/new
2. Note: `ayintap-deploy`
3. Expiration: 90 days (veya custom)
4. Scopes: ✅ `repo` (tümü)
5. "Generate token" → tokenı kopyala (sadece bir kez gösterilir)

### Seçenek B — SSH (daha güvenli, uzun vadeli)

1. Container'da: `ssh-keygen -t ed25519 -C "ayintap"`
2. `cat ~/.ssh/id_ed25519.pub` çıktısını kopyala
3. https://github.com/settings/keys → "New SSH key" → yapıştır

---

## 3. Mevcut Workspace'ten Push Et

```bash
cd /app

# Remote ekle (HTTPS + token ile)
git remote add origin https://<TOKEN>@github.com/<KULLANICI>/ayintap-balta-kilic.git

# Veya SSH ile
git remote add origin git@github.com:<KULLANICI>/ayintap-balta-kilic.git

# Branch ismini main yap (zaten main)
git branch -M main

# İlk push
git push -u origin main
```

✅ Bu kadar! Tüm geçmiş GitHub'a aktarıldı.

---

## 4. Başka Workspace/Hesaptan Devam Etmek

Yeni bir workspace açtığında:

```bash
# Clone
git clone https://github.com/<KULLANICI>/ayintap-balta-kilic.git
cd ayintap-balta-kilic

# .env oluştur (asla commit edilmez)
cp .env.example .env
# .env içindeki MONGO_URL, JWT_SECRET, vb. doldur

# Bağımlılıklar
yarn install

# Geliştirme sunucusunu başlat
yarn dev
```

### Yeni LLM Agent ile Devam

Agent'a şunu söyle:

> "Bu projeyi `PROJECT_CONTEXT.md` ve `TASKS.md` üzerinden devral. README'deki kurulum adımlarını izle. Tamamlanmamış görevlerden öncelik sırasıyla devam et."

Tüm context bu dosyalarda canlı:
- `README.md` — Setup & overview
- `PROJECT_CONTEXT.md` — Mimari kararlar, durum snapshot
- `TASKS.md` — Faz bazlı checklist
- `.env.example` — Tüm gerekli env değişkenleri

---

## 5. Düzenli Commit Yapısı (Tavsiye)

```bash
# Yeni özellik
git commit -m "feat(scope): kısa açıklama"

# Bug fix
git commit -m "fix(scope): hata düzeltmesi"

# Refactor
git commit -m "refactor(scope): yeniden düzenleme"

# Dökümantasyon
git commit -m "docs: güncelleme"

# Stil / formatting
git commit -m "style: formatting"

# Test
git commit -m "test(scope): test eklendi"
```

Örnek scope: `auth`, `cms`, `admin`, `shop`, `blog`, `payment`

---

## 6. Branch Stratejisi (Tavsiye)

```
main        ← production-ready
├── develop ← integration branch
│   ├── feature/iyzico-integration
│   ├── feature/coupon-system
│   └── fix/cart-bug
```

Feature dallarını birleştirirken:
```bash
git checkout develop
git merge --no-ff feature/iyzico-integration
git push
```

Production'a hazır olduğunda:
```bash
git checkout main
git merge --no-ff develop
git tag v1.0.0
git push --tags
```

---

## 7. Vercel ile Otomatik Deploy

1. https://vercel.com/new
2. "Import Git Repository" → GitHub'ı bağla → bu repo'yu seç
3. Environment Variables sekmesine `.env`'deki **tüm** değişkenleri ekle (MONGO_URL, JWT_SECRET, CLOUDINARY_*, vb.)
4. Deploy

Her `git push origin main` otomatik production'a deploy olur.

---

## 8. Acil Durum

### Yanlışlıkla .env'i commit ettiysem?

```bash
git rm --cached .env
git commit -m "fix: remove .env from tracking"
git push
# JWT_SECRET ve API key'lerini rotate et!
```

### Bir commiti geri almak

```bash
git revert <commit-hash>
git push
```

### Belirli bir commit'e dönmek (geçmişe gitmek)

```bash
git reset --hard <commit-hash>
git push --force-with-lease
```

⚠️ `--force` paylaşımlı branchlerde dikkatli kullan.

---

## ✅ Kontrol Listesi

- [ ] GitHub'da private repo oluşturuldu
- [ ] PAT veya SSH key hazırlandı
- [ ] `git remote add origin ...` çalıştırıldı
- [ ] `git push -u origin main` başarılı
- [ ] `.env` **kesinlikle** repoda değil (`.gitignore` kontrol et)
- [ ] Vercel deploy ayarlandı (opsiyonel)
- [ ] PROJECT_CONTEXT.md güncel
- [ ] TASKS.md güncel
