# AniManxwa Backend

Express + MongoDB + Cloudinary. Rasmlar Cloudinary'da, kichik ma'lumotlar (nom, bob raqami va h.k.) MongoDB'da saqlanadi.

## 🆕 Yangiliklar (bu safar qo'shilganlar)

1. **Mangani tahrirlash** — backend'da allaqachon bor edi (`PUT /api/series/:id`), frontend ulanganda ishlaydi.
2. **Tavsiya algoritmi** — foydalanuvchi saqlagan mangalar janriga mos boshqa mangalarni qaytaradi: `GET /api/series/recommendations/by-genre?genres=Fantaziya,Drama&exclude=id1,id2`
3. **Shikoyatlar (Reports) + Ban/Unban** — foydalanuvchi manga/bobga shikoyat yuboradi, admin panelida ko'rinadi, admin bloklashi/blokdan chiqarishi mumkin.
4. **Reklama tizimi (Ads)** — pastki banner va bob ochilganda ko'rsatiladigan reklama, admin tomonidan boshqariladi (necha marta ko'rsatilishi, necha soniya, qachondan-qachongacha).

**Yangi environment o'zgaruvchi kerak emas** — hammasi mavjud MongoDB va Cloudinary orqali ishlaydi.

### Qaysi fayllar yangi, qaysilari o'zgargan

| Fayl | Holati |
|---|---|
| `models/Report.js` | 🆕 yangi |
| `models/BannedUser.js` | 🆕 yangi |
| `models/Ad.js` | 🆕 yangi |
| `routes/reports.js` | 🆕 yangi |
| `routes/ads.js` | 🆕 yangi |
| `routes/series.js` | ✏️ o'zgargan (tavsiya endpoint'i qo'shildi) |
| `models/Chapter.js` | ✏️ o'zgargan (`pageCount` maydoni qo'shildi) |
| `routes/chapters.js` | ✏️ o'zgargan (`pageCount` saqlanadi) |
| `server.js` | ✏️ o'zgargan (yangi route'lar ulandi) |
| `config/cloudinary.js` | ✏️ o'zgargan (video yuklashni ham qo'llab-quvvatlaydi, reklama uchun) |

Boshqa fayllar (`package.json`, `models/Series.js`, `models/Chapter.js` va h.k.) o'zgarmagan.

## 🔄 Mavjud loyihangizni yangilash (siz allaqachon deploy qilgansiz)

1. Yuqoridagi jadvaldagi fayllarni shu zip'dan oling va GitHub repo'ingizdagi bir xil joylarga qo'ying (yangilarini qo'shing, o'zgarganlarini almashtiring)
2. Terminalda repo papkangizda:
   ```
   git add .
   git commit -m "Tavsiya, shikoyat/ban va reklama tizimi qo'shildi"
   git push
   ```
3. Render avtomatik push'ni ko'rib, qayta deploy qiladi (Render dashboard'da "Events" bo'limidan borishini kuzatishingiz mumkin). Agar avtomatik boshlamasa, "Manual Deploy" → "Deploy latest commit" tugmasini bosing.
4. Bir necha daqiqadan so'ng API yangilangan bo'ladi — hech qanday yangi sozlama kerak emas.

## Yangi endpoint'lar (frontend ulanganda ishlatiladi)

- `POST /api/reports` — shikoyat yuborish (public)
- `GET /api/reports` — barcha shikoyatlar (admin)
- `POST /api/reports/ban` / `POST /api/reports/unban` — (admin)
- `GET /api/ads/active?placement=banner` yoki `chapter-interstitial` — ko'rsatiladigan reklamani olish (public)
- `POST /api/ads/:id/impression` — reklama ko'rsatilganini belgilash (public)
- `GET /api/ads`, `POST /api/ads`, `PUT /api/ads/:id`, `DELETE /api/ads/:id` — admin boshqaruvi
- `GET /api/series/recommendations/by-genre` — janr bo'yicha tavsiya (public)

## ⚠️ Bir muhim eslatma (ban tizimi haqida)

Hali haqiqiy Google/parol orqali kirish yo'q — "foydalanuvchi" hozircha har bir qurilma/brauzerning o'z profiliga bog'langan tasodifiy ID. Ban shu ID'ni bloklaydi (shikoyat yubora olmaydi). Bu spam/suiiste'mol qiluvchilarni to'xtatish uchun yetarli, lekin qat'iy himoya emas — ID'ni "tozalab" qayta boshlash nazariy jihatdan mumkin. To'liq ishonchli ban uchun kelajakda haqiqiy hisob tizimi (Google login) kerak bo'ladi.

## 🆕 Yangiliklar (Google orqali kirish)

Backend endi Google ID token'ini tekshiradi va foydalanuvchini MongoDB'da (`User` jadvali) saqlaydi.

| Fayl | Holati |
|---|---|
| `models/User.js` | 🆕 yangi |
| `routes/auth.js` | 🆕 yangi (`POST /api/auth/google`) |
| `server.js` | ✏️ o'zgargan |
| `package.json` | ✏️ o'zgargan (`google-auth-library` qo'shildi) |

### Google Cloud Console'da sozlash
1. https://console.cloud.google.com → yangi loyiha yarating (yoki mavjudini tanlang)
2. "APIs & Services" → "OAuth consent screen" — ilova nomi, email kabi asosiy ma'lumotlarni to'ldiring (test rejimida qoldirsa ham bo'ladi)
3. "Credentials" → "Create Credentials" → "OAuth client ID" → turi: **Web application**
4. **Authorized JavaScript origins**'ga frontend joylashgan aniq manzilni qo'shing (pastga qarang — bu eng muhim qadam)
5. Yaratilgan **Client ID**'ni oling (masalan `123...apps.googleusercontent.com`)
6. Render'dagi Environment'ga `GOOGLE_CLIENT_ID` qo'shing (shu qiymat bilan)
7. `animanxwa.jsx` faylining boshidagi `GOOGLE_CLIENT_ID` qatoriga ham xuddi shu qiymatni yozing

## ⚠️ MUHIM CHEKLOV: bu shu chat oynasida ishlamaydi

Google, "Sign in with Google" tugmasi qaysi aniq veb-manzil(lar)dan ishga tushishini oldindan bilishni talab qiladi (Authorized JavaScript origins), va bundan tashqari begona sayt ichiga joylashtirilgan oynalarda (iframe) ishlashni ataylab cheklaydi — bu firibgarlikning oldini olish uchun. Claude chatidagi ilova aynan shunday, tashqi (begona) oynada ko'rsatiladi va o'zining doimiy manzili yo'q. Shuning uchun tugma shu yerda hech qachon to'liq ishlamaydi — bu xato emas, kod ham noto'g'ri emas, bu Google'ning qasddan qo'ygan cheklovi.

**Yechim:** frontendni haqiqiy, alohida manzilga joylashtirish kerak. Shu uchun yana bitta fayl tayyorladim: **`animanxwa-frontend-site.zip`** — bu xuddi shu ilovani **Vercel**'ga (bepul) joylash uchun tayyor loyiha.

### Frontendni Vercel'ga joylash
1. `animanxwa-frontend-site.zip`'ni oching, ichidagilarni yangi GitHub repo'ga yuklang (masalan `animanxwa-frontend`)
2. https://vercel.com — GitHub bilan hisob oching
3. "Add New" → "Project" → shu repo'ni tanlang — Vercel Vite loyihasini avtomatik taniydi, sozlash shart emas
4. "Deploy" tugmasini bosing — bir necha daqiqada `https://animanxwa-frontend.vercel.app` kabi manzil beriladi
5. Shu manzilni Google Cloud Console'dagi **Authorized JavaScript origins**'ga qo'shing (masalan `https://animanxwa-frontend.vercel.app`)
6. Endi shu Vercel manzilini ochsangiz, Google orqali kirish to'liq ishlaydi

Claude chatidagi versiya (`animanxwa.jsx`) barcha boshqa narsalar uchun (o'qish, admin, shikoyat, reklama) ishlashda davom etadi — faqat Google tugmasi o'rniga "hozircha qo'lda kiriting" degan xabar chiqadi, bu kutilgan holat.


### 1. MongoDB Atlas (ma'lumotlar bazasi)
1. https://mongodb.com/cloud/atlas — bepul hisob oching
2. Yangi cluster yarating (**Free / M0** reja yetarli)
3. "Database Access"da foydalanuvchi yarating (username + password)
4. "Network Access"da **Allow access from anywhere** (0.0.0.0/0) qo'shing
5. "Connect" → "Drivers" → connection string'ni nusxalang, `<password>` o'rniga haqiqiy parolingizni yozing

### 2. Cloudinary (rasm va video)
1. https://cloudinary.com — bepul hisob oching
2. Dashboard'da **Cloud Name**, **API Key**, **API Secret** ko'rinadi — shularni saqlab qo'ying

### 3. GitHub
1. Yangi repository yarating, masalan `animanxwa-backend`
2. Shu papkadagi barcha fayllarni o'sha repoga yuklang. `.env` fayli **hech qachon** yuklanmasin — `.gitignore` buni oldini oladi

### 4. Render
1. https://render.com — hisob oching, GitHub akkauntingizni ulang
2. **New +** → **Web Service** → repongizni tanlang
3. Build Command: `npm install`
4. Start Command: `npm start`
5. **Environment** bo'limiga `.env.example` dagi ro'yxatni qo'shing (`MONGODB_URI`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `GOOGLE_CLIENT_ID`, `ADMIN_CODE_1`, `ADMIN_CODE_2`, `JWT_SECRET`, `NODE_ENV=production`)
6. **Create Web Service** tugmasini bosing

### Tekshirish
`https://sizning-nomingiz.onrender.com/` manzilida `{"status":"AniManxwa API ishlayapti"}` chiqishi kerak.

### Bepul reja haqida eslatma
Render'ning bepul rejasida server 15 daqiqa foydalanilmasa uxlab qoladi — keyingi so'rovda qayta uyg'onishi ~30-60 soniya vaqt oladi. Bu xato emas, odatiy holat.

## 🆕 Yangiliklar (chiroyli havolalar, domen, himoya)

| Fayl | Holati |
|---|---|
| `models/Counter.js` | 🆕 yangi (global hisoblagich) |
| `config/counter.js` | 🆕 yangi |
| `models/Series.js` | ✏️ o'zgargan (`slug` maydoni) |
| `models/Chapter.js` | ✏️ o'zgargan (`readingId` maydoni) |
| `routes/series.js` | ✏️ o'zgargan (slug yaratish + `/by-slug/:slug`) |
| `routes/chapters.js` | ✏️ o'zgargan (readingId + `/by-reading-id/:id`) |

### Havolalar qanday ishlaydi
- Har bir manga qo'shilganda, nomidan avtomatik **slug** yasaladi va abadiy shunday qoladi (masalan "Solo Leveling" → `Solo-Leveling`). Nomi bir xil bo'lsa, `-2`, `-3` qo'shiladi. Manga sahifasi: `https://.../Solo-Leveling`
- Har bir bob qo'shilganda, **butun sayt bo'yicha** ketma-ket raqam beriladi (birinchi manganing 1-bobi ham, ikkinchi manganing 1-bobi ham — ikkalasi ham navbatdagi raqamni oladi). Bob sahifasi: `https://.../Oqilmoqda-7`
- Manga tahrirlanganda slug **o'zgarmaydi** — bu ataylab shunday, aks holda avval ulashilgan havolalar ishlamay qolardi

### Yuklab olishdan himoya
Rasmda o'ng tugma bosish, sudrab olish, va **Ctrl+S / Cmd+S** endi ishlamaydi (brauzer "Saqlash" oynasi ochilmaydi). Buni ham ochiq aytib qo'yay: bu haqiqiy himoya emas, faqat oddiy urinishlarni to'xtatadi — brauzer DevTools yoki tarmoq so'rovlarini ko'rish orqali istalgan veb-sahifadagi rasmni baribir olish mumkin. Bunga qarshi 100% himoya web texnologiyasida umuman mavjud emas (istalgan sayt uchun shunday).

### Admin Paneli tugmasi
Profilda admin kodi kiritilgach, endi "Admin Paneli" degan alohida tugma chiqadi — bosilganda to'g'ridan-to'g'ri admin bo'limiga o'tkazadi.

## 🌐 Domen (o'z domeningizni ulash)

**Qisqa javob: hech narsa buzilmaydi.** Domen — bu shunchaqi "old eshik" belgisi; ma'lumotlaringiz (MongoDB) va rasmlar (Cloudinary) butunlay alohida joyda turadi va domenga bog'liq emas. Domen almashtirilganda yoki qo'shilganda mangalar, boblar, foydalanuvchilar — hech biri o'chib ketmaydi.

### Backend uchun (Render)
1. Render dashboard → xizmatingiz → "Settings" → "Custom Domain" → domeningizni kiriting
2. Render bergan DNS yozuvini (CNAME) domen ro'yxatdan o'tkazgan joyingizda (masalan Namecheap, GoDaddy) qo'shing
3. Bir necha daqiqadan keyin Render avtomatik SSL sertifikat beradi
4. Agar shu YANGI domenni backend manzili sifatida ishlatmoqchi bo'lsangiz, frontend fayllaridagi `API_BASE` qatorini yangi domenga yangilang (aks holda eski `onrender.com` manzili baribir ishlashda davom etadi — ikkalasi ham bir xil serverga olib boradi)

### Frontend uchun (Vercel)
1. Vercel loyihangiz → "Settings" → "Domains" → domeningizni qo'shing
2. Ko'rsatilgan DNS yozuvini qo'shing
3. Agar bu domenni ishlatsangiz, uni Google Cloud Console'dagi "Authorized JavaScript origins"ga ham qo'shishni unutmang — aks holda Google kirish o'sha yangi domenda ishlamay qoladi

## Keyingi qadam

Hozircha so'ralganlarning barchasi tayyor. Yangi narsa kerak bo'lsa — ayting.
