# AniManxwa

Manga/manhwa/manhua/roman o'qish platformasi. Backend: Express + MongoDB + Cloudinary (Render'da). Frontend: React (Vercel'da).

Bu fayl endi ishga tushirish uchun to'liq, yagona qo'llanma — barcha oldingi qo'shimchalar shu ichiga jamlangan.

## 🚀 Ishga tushirish — to'liq qo'llanma

Kod tomoni to'liq tayyor. Saytni haqiqiy, hammaga ochiq qilish uchun quyidagi 6 qadamni ketma-ket bajaring.

### 1-qadam: MongoDB Atlas (ma'lumotlar bazasi)
1. https://mongodb.com/cloud/atlas — bepul hisob oching
2. Yangi cluster yarating (**Free / M0** reja yetarli)
3. "Database Access"da foydalanuvchi yarating (username + password)
4. "Network Access"da **Allow access from anywhere** (0.0.0.0/0) qo'shing
5. "Connect" → "Drivers" → connection string'ni nusxalang, `<password>` o'rniga haqiqiy parolingizni yozing — bu `MONGODB_URI` bo'ladi

### 2-qadam: Cloudinary (rasm va video saqlash)
1. https://cloudinary.com — bepul hisob oching
2. Dashboard'da **Cloud Name**, **API Key**, **API Secret** ko'rinadi — saqlab qo'ying

### 3-qadam: Google Cloud Console (Google orqali kirish uchun)
1. https://console.cloud.google.com → yangi loyiha yarating
2. "APIs & Services" → "OAuth consent screen" — ilova nomi, email kabi ma'lumotlarni to'ldiring (test rejimida qoldirsa ham bo'ladi)
3. "Credentials" → "Create Credentials" → "OAuth client ID" → turi: **Web application**
4. **Authorized JavaScript origins** — hozircha bo'sh qoldiring, 6-qadamda qaytib to'ldirasiz
5. Yaratilgan **Client ID**'ni saqlab qo'ying (masalan `123...apps.googleusercontent.com`)

### 4-qadam: Backend'ni GitHub'ga yuklab, Render'da ishga tushirish
1. Yangi GitHub repository yarating (masalan `animanxwa-backend`), `animanxwa-backend.zip` ichidagi barcha fayllarni shu repoga yuklang. `.env` fayli hech qachon yuklanmasin — `.gitignore` buni oldini oladi
2. https://render.com — hisob oching, GitHub'ni ulang
3. **New +** → **Web Service** → repongizni tanlang
4. Build Command: `npm install` · Start Command: `npm start`
5. **Environment** bo'limiga quyidagi barcha o'zgaruvchilarni qo'shing:

   | O'zgaruvchi | Qiymat |
   |---|---|
   | `MONGODB_URI` | 1-qadamdagi connection string |
   | `CLOUDINARY_CLOUD_NAME` | 2-qadamdan |
   | `CLOUDINARY_API_KEY` | 2-qadamdan |
   | `CLOUDINARY_API_SECRET` | 2-qadamdan |
   | `GOOGLE_CLIENT_ID` | 3-qadamdan |
   | `ADMIN_CODE_1` | o'zingiz o'ylab toping (masalan `AniManxwa.2026.uz`) |
   | `ADMIN_CODE_2` | o'zingiz o'ylab toping (masalan `AniManxwa.Shadow.2026.SsSsS`) |
   | `JWT_SECRET` | uzun, tasodifiy matn (40+ belgidan) |
   | `NODE_ENV` | `production` |

6. **Create Web Service** tugmasini bosing — bir necha daqiqada tayyor bo'ladi
7. Tekshiring: `https://sizning-nomingiz.onrender.com/` manzilida `{"status":"AniManxwa API ishlayapti"}` chiqishi kerak

### 5-qadam: Frontend'ni Vercel'ga joylash
1. `animanxwa-frontend-site.zip`'ni oching. Ichidagi `src/App.jsx` faylida ikkita qatorni o'zingiznikiga almashtiring: `API_BASE` (4-qadamdagi Render manzilingiz) va `GOOGLE_CLIENT_ID` (3-qadamdagi Client ID)
2. Barcha fayllarni yangi GitHub repoga yuklang (masalan `animanxwa-frontend`)
3. https://vercel.com — GitHub bilan hisob oching
4. "Add New" → "Project" → shu repo'ni tanlang — Vercel Vite loyihasini avtomatik taniydi, sozlash shart emas
5. "Deploy" tugmasini bosing — bir necha daqiqada `https://animanxwa-frontend.vercel.app` kabi manzil beriladi. **Shu manzil — saytingizning asosiy, hammaga ko'rinadigan manzili.**

### 6-qadam: Google Cloud Console'ga qaytib, Vercel manzilini qo'shish
1. 3-qadamdagi OAuth client sozlamalariga qayting
2. **Authorized JavaScript origins**'ga 5-qadamdagi Vercel manzilini qo'shing
3. Saqlang — bir necha daqiqada kuchga kiradi

Shu bilan sayt to'liq ishga tushdi — kimdir Vercel manzilingizni ochsa, to'liq ishlaydigan AniManxwa'ni ko'radi, Google kirish ham shu yerda ishlaydi.

## ✅ Tekshirish ro'yxati

Vercel manzilingizni ochib, quyidagilarni sinab ko'ring:
- [ ] Bosh sahifa ochiladi, katalog ko'rinadi (hali manga qo'shmagan bo'lsangiz bo'sh bo'lishi normal)
- [ ] Profilda admin kodini kiritib, "Admin Paneli" tugmasi chiqadi
- [ ] Admin panelidan bitta manga va bitta bob qo'shib ko'ring
- [ ] Qo'shilgan manga bosh sahifada/qidiruvda chiqadi, ochilganda o'qiladi
- [ ] Profilda "Google orqali kirish" tugmasi endi chiqadi va ishlaydi (Claude chatida ishlamagani — bu kutilgan holat edi)
- [ ] Kirgandan so'ng, bepul manganing "Yuklab olish" tugmasi PDF yuklab beradi
- [ ] Manga havolasi chiroyli ko'rinishda: `/Manga-Nomi`, bob esa `/Oqilmoqda-1`

## ⚠️ Bilib qo'yish kerak bo'lgan cheklovlar

- **Ban tizimi** — qurilma/hisobga bog'langan ID'ni bloklaydi; qat'iy, 100% chetlab o'tib bo'lmaydigan himoya emas.
- **Yuklab olishdan himoya** (o'ng tugma, Ctrl+S) — oddiy urinishlarni to'xtatadi, lekin DevTools orqali baribir olish mumkin. Web texnologiyasida 100% himoya umuman yo'q.
- **Google qidiruvda ko'rinish (SEO)** — hozircha yaxshi emas, chunki sayt client-side React ilova. Sahifa sarlavhasi/tavsifi avtomatik yangilanadi (kichik yordam), lekin to'liq yechim uchun server-side rendering (masalan Next.js) kerak — bu alohida, ancha katta loyiha.
- **Render bepul reja** — 15 daqiqa foydalanilmasa server uxlab qoladi, birinchi so'rov ~30-60 soniya kutadi. Xato emas, odatiy holat.
- **To'lov tizimi** — haqiqiy to'lov (Stripe va h.k.) integratsiyasi hali yo'q. Obunani hozircha admin panelidan ("Foydalanuvchilar" bo'limi) qo'lda berasiz/olib tashlaysiz.

## 📋 Nima qila oladi (xususiyatlar ro'yxati)

- Bosh sahifa: qidiruv, aylanadigan banner, 3 ustunli katalog
- Qidiruv: nomi va teglar bo'yicha, janr filtri bilan
- Saqlanganlar + saqlangan janrlarga mos tavsiya
- O'qish: manga/roman — sahifama-sahifa; manhwa/manhua — tez yuklanadigan (avtomatik ~100 qismga kesilgan) tasma
- PDF qilib yuklab olish — faqat bepul mangalarda, login talab qiladi, yangi hisobga 10 ta bepul huquq, keyin obuna kerak
- Google orqali kirish (haqiqiy hisob, MongoDB'da saqlanadi)
- Shikoyat yuborish + admin tomonidan ban/unban
- Reklama tizimi — pastki banner va bobga kirishdagi reklama, admin boshqaradi (soni, davomiyligi, sanasi)
- Admin paneli: mangalar (qo'shish/tahrirlash/o'chirish), shikoyatlar, reklamalar, tarjimonlik so'rovlari, foydalanuvchilar (obuna berish)
- Chiroyli, abadiy havolalar: `/Manga-Nomi`, `/Oqilmoqda-N`
- Tong/tun rejimi

## 🔌 API endpoint'lar (ma'lumot uchun)

- `GET /api/series`, `GET /api/series/:id`, `GET /api/series/by-slug/:slug`, `GET /api/series/recommendations/by-genre`
- `POST /api/series`, `PUT /api/series/:id`, `DELETE /api/series/:id` — admin
- `GET /api/chapters/:id`, `GET /api/chapters/by-reading-id/:id`
- `POST /api/chapters`, `DELETE /api/chapters/:id` — admin
- `POST /api/downloads/chapters/:id` — login talab qiladi
- `POST /api/auth/google`
- `POST /api/admin/verify`, `GET /api/admin/users`, `PATCH /api/admin/users/:id/subscription`
- `POST /api/reports`, `GET /api/reports`, `POST /api/reports/ban`, `POST /api/reports/unban`
- `GET/POST/PUT/DELETE /api/ads`, `GET /api/ads/active`, `POST /api/ads/:id/impression`
- `POST /api/translator-requests`, `GET /api/translator-requests` — admin

## 🌐 O'z domeningizni ulash (ixtiyoriy)

**Hech narsa buzilmaydi** — ma'lumotlar (MongoDB) va rasmlar (Cloudinary) domenga bog'liq emas.

**Backend uchun (Render):** Settings → Custom Domain → domeningizni kiriting → berilgan DNS yozuvini domen ro'yxatdan o'tkazgan joyingizda (Namecheap, GoDaddy va h.k.) qo'shing.

**Frontend uchun (Vercel):** Settings → Domains → domeningizni qo'shing → ko'rsatilgan DNS yozuvini qo'shing → Google Cloud Console'dagi **Authorized JavaScript origins**'ga ham qo'shishni unutmang.

## Keyingi qadam

Hozircha so'ralganlarning barchasi tayyor. Yangi narsa kerak bo'lsa — ayting.
