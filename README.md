# AniManxwa Backend

Express + MongoDB + Cloudinary. Rasmlar Cloudinary'da, kichik ma'lumotlar (nom, bob raqami va h.k.) MongoDB'da saqlanadi.

## 1. MongoDB Atlas (ma'lumotlar bazasi)
1. https://mongodb.com/cloud/atlas — bepul hisob oching
2. Yangi cluster yarating (**Free / M0** reja yetarli)
3. "Database Access"da foydalanuvchi yarating (username + password)
4. "Network Access"da **Allow access from anywhere** (0.0.0.0/0) qo'shing
5. "Connect" → "Drivers" → connection string'ni nusxalang, `<password>` o'rniga haqiqiy parolingizni yozing

## 2. Cloudinary (rasmlar)
1. https://cloudinary.com — bepul hisob oching
2. Dashboard'da **Cloud Name**, **API Key**, **API Secret** ko'rinadi — shularni saqlab qo'ying

## 3. GitHub
1. Yangi repository yarating, masalan `animanxwa-backend`
2. Shu papkadagi barcha fayllarni o'sha repoga yuklang (push qiling). `.env` fayli **hech qachon** yuklanmasin — `.gitignore` buni avtomatik oldini oladi

## 4. Render
1. https://render.com — hisob oching, GitHub akkauntingizni ulang
2. **New +** → **Web Service** → repongizni tanlang
3. Build Command: `npm install`
4. Start Command: `npm start`
5. **Environment** bo'limiga quyidagilarni qo'shing (`.env.example` faylidagi ro'yxat bo'yicha):
   - `MONGODB_URI`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ADMIN_CODE_1`
   - `ADMIN_CODE_2`
   - `JWT_SECRET` — uzun, tasodifiy matn (masalan 40+ belgidan iborat)
   - `NODE_ENV` — `production`
6. **Create Web Service** tugmasini bosing — bir necha daqiqada tayyor bo'ladi

## Tekshirish
Deploy tugagach `https://sizning-nomingiz.onrender.com/` manzilini oching.
`{"status":"AniManxwa API ishlayapti"}` ko'rinsa — hammasi ishlayapti.

## Muhim eslatma (bepul reja)
Render'ning bepul rejasida server 15 daqiqa foydalanilmasa "uxlab qoladi" — keyingi so'rovda qayta uyg'onishi ~30-60 soniya vaqt oladi. Bu odatiy holat, xato emas.

## Keyingi qadam
Bu — faqat backend (server) qismi. Frontend (React ilova)dagi `window.storage` chaqiruvlarini shu API manzillariga ulash kerak bo'ladi — server ishga tushgach, shuni ham qilib beraman.
