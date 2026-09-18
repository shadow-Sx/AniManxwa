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

---

## Boshidan o'rnatish (agar kerak bo'lsa)

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
5. **Environment** bo'limiga `.env.example` dagi ro'yxatni qo'shing (`MONGODB_URI`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `ADMIN_CODE_1`, `ADMIN_CODE_2`, `JWT_SECRET`, `NODE_ENV=production`)
6. **Create Web Service** tugmasini bosing

### Tekshirish
`https://sizning-nomingiz.onrender.com/` manzilida `{"status":"AniManxwa API ishlayapti"}` chiqishi kerak.

### Bepul reja haqida eslatma
Render'ning bepul rejasida server 15 daqiqa foydalanilmasa uxlab qoladi — keyingi so'rovda qayta uyg'onishi ~30-60 soniya vaqt oladi. Bu xato emas, odatiy holat.

## Keyingi qadam

Bu — backend (server) qismi. Frontend (React ilova)ni shu yangi endpoint'larga ulash — keyingi ishim: `window.storage` chaqiruvlarini serverga ulayman va shikoyat/ban, tavsiya, reklama ko'rinishlarini frontend'ga qo'shaman.
