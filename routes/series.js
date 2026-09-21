const express = require('express');
const multer = require('multer');
const Series = require('../models/Series');
const Chapter = require('../models/Chapter');
const requireAdmin = require('../middleware/adminAuth');
const { uploadBuffer, deleteByPublicId } = require('../config/cloudinary');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// Builds a URL-friendly slug from a title (spaces -> hyphens, keeps original
// casing per the requested style), adding -2, -3... if it's already taken.
function slugify(title, existingSlugs) {
  let base = (title || 'manga').trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  if (!base) base = 'manga';
  let slug = base;
  let n = 2;
  while (existingSlugs.has(slug)) {
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}

// Public: list all series with chapter counts
router.get('/', async (req, res) => {
  try {
    const series = await Series.find().sort({ createdAt: -1 });
    const withCounts = await Promise.all(
      series.map(async (s) => {
        const chapterCount = await Chapter.countDocuments({ seriesId: s._id });
        return { ...s.toObject(), chapterCount };
      })
    );
    res.json(withCounts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Public: genre-based recommendations (used on the Saved screen —
// "shows more like what you've saved"). Must stay above /:id below.
router.get('/recommendations/by-genre', async (req, res) => {
  try {
    const genres = (req.query.genres || '').split(',').filter(Boolean);
    const excludeIds = (req.query.exclude || '').split(',').filter(Boolean);
    if (genres.length === 0) return res.json([]);
    const all = await Series.find({ _id: { $nin: excludeIds } });
    const scored = all
      .map((s) => ({ s, score: (s.genres || []).filter((g) => genres.includes(g)).length }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.s);
    res.json(scored);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Public: one series by its slug (this is what a direct link like /Solo-Leveling resolves)
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const s = await Series.findOne({ slug: req.params.slug });
    if (!s) return res.status(404).json({ error: 'Topilmadi' });
    const chapters = await Chapter.find({ seriesId: s._id }).select('-pages').sort({ createdAt: 1 });
    res.json({ ...s.toObject(), chapters });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Public: one series + its chapter list (without page images, for speed)
router.get('/:id', async (req, res) => {
  try {
    const s = await Series.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Topilmadi' });
    const chapters = await Chapter.find({ seriesId: s._id }).select('-pages').sort({ createdAt: 1 });
    res.json({ ...s.toObject(), chapters });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: create series (multipart form, field "cover" + field "data" as JSON string)
router.post('/', requireAdmin, upload.single('cover'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    let coverUrl, coverPublicId;
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, 'animanxwa/covers');
      coverUrl = result.secure_url;
      coverPublicId = result.public_id;
    }
    const existing = await Series.find({}, 'slug');
    const existingSlugs = new Set(existing.map((s) => s.slug).filter(Boolean));
    const slug = slugify(data.title, existingSlugs);
    const series = await Series.create({ ...data, slug, coverUrl, coverPublicId });
    res.status(201).json(series);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: edit series
router.put('/:id', requireAdmin, upload.single('cover'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    const update = { ...data };
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, 'animanxwa/covers');
      update.coverUrl = result.secure_url;
      update.coverPublicId = result.public_id;
    }
    const series = await Series.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(series);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: delete series + all its chapters + their Cloudinary images
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const chapters = await Chapter.find({ seriesId: req.params.id });
    for (const ch of chapters) {
      for (const p of ch.pages) await deleteByPublicId(p.publicId);
    }
    await Chapter.deleteMany({ seriesId: req.params.id });
    const s = await Series.findById(req.params.id);
    if (s?.coverPublicId) await deleteByPublicId(s.coverPublicId);
    await Series.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
