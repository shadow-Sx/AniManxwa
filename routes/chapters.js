const express = require('express');
const multer = require('multer');
const Chapter = require('../models/Chapter');
const Series = require('../models/Series');
const requireAdmin = require('../middleware/adminAuth');
const { uploadBuffer, deleteByPublicId } = require('../config/cloudinary');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// Public: fetch one chapter's pages (this is what the reader screen calls)
router.get('/:chapterId', async (req, res) => {
  try {
    const ch = await Chapter.findById(req.params.chapterId);
    if (!ch) return res.status(404).json({ error: 'Topilmadi' });
    res.json(ch);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: add a chapter (multipart form — field "pages" as multiple files)
router.post('/', requireAdmin, upload.array('pages', 300), async (req, res) => {
  try {
    const { seriesId, season, volume, chapter, title } = req.body;
    if (!seriesId || !chapter) return res.status(400).json({ error: 'seriesId va chapter shart' });
    const series = await Series.findById(seriesId);
    if (!series) return res.status(404).json({ error: 'Manga topilmadi' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Kamida bitta sahifa kerak' });

    // Sort by original filename so page order matches upload order (e.g. 001.jpg, 002.jpg)
    const sorted = [...req.files].sort((a, b) => a.originalname.localeCompare(b.originalname, undefined, { numeric: true }));
    const pages = [];
    for (const f of sorted) {
      const result = await uploadBuffer(f.buffer, `animanxwa/${seriesId}`);
      pages.push({ url: result.secure_url, publicId: result.public_id });
    }
    const doc = await Chapter.create({ seriesId, season, volume, chapter, title, pageCount: pages.length, pages });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: delete a chapter + its Cloudinary images
router.delete('/:chapterId', requireAdmin, async (req, res) => {
  try {
    const ch = await Chapter.findById(req.params.chapterId);
    if (!ch) return res.status(404).json({ error: 'Topilmadi' });
    for (const p of ch.pages) await deleteByPublicId(p.publicId);
    await Chapter.findByIdAndDelete(req.params.chapterId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
