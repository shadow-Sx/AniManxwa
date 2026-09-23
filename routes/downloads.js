const express = require('express');
const fetch = require('node-fetch');
const PDFDocument = require('pdfkit');
const Chapter = require('../models/Chapter');
const Series = require('../models/Series');
const User = require('../models/User');
const requireUser = require('../middleware/userAuth');

const router = express.Router();

router.post('/chapters/:chapterId', requireUser, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ error: 'Bob topilmadi' });
    const series = await Series.findById(chapter.seriesId);
    if (!series) return res.status(404).json({ error: 'Manga topilmadi' });

    // Downloads only ever exist for free content — paid/subscription series
    // never get this feature at all, regardless of who's asking.
    if (series.payment === 'subscription') {
      return res.status(403).json({ error: 'Bu manhwa yuklab olish uchun mavjud emas' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });

    if (!user.isSubscribed) {
      if (user.downloadBonusRemaining <= 0) {
        return res.status(402).json({ error: 'Yuklab olish limitingiz tugadi — davom etish uchun obuna oling', needsSubscription: true });
      }
      user.downloadBonusRemaining -= 1;
      await user.save();
    }

    const safeName = (series.slug || 'manhwa').replace(/[^a-zA-Z0-9-]/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}-${chapter.chapter}.pdf"`);

    const doc = new PDFDocument({ autoFirstPage: false });
    doc.pipe(res);

    for (const page of chapter.pages) {
      const imgRes = await fetch(page.url);
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const w = page.width || 800;
      const h = page.height || 1200;
      doc.addPage({ size: [w, h], margin: 0 });
      doc.image(buf, 0, 0, { width: w, height: h });
    }
    doc.end();
  } catch (e) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
    else res.end();
  }
});

module.exports = router;
