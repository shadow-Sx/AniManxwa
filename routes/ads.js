const express = require('express');
const multer = require('multer');
const Ad = require('../models/Ad');
const requireAdmin = require('../middleware/adminAuth');
const { uploadBuffer, deleteByPublicId } = require('../config/cloudinary');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });

// Public: get one eligible ad for a placement ("banner" or "chapter-interstitial")
router.get('/active', async (req, res) => {
  try {
    const { placement } = req.query;
    const now = new Date();
    const candidates = await Ad.find({ placement, active: true });
    const eligible = candidates.filter(
      (a) =>
        (!a.startDate || a.startDate <= now) &&
        (!a.endDate || a.endDate >= now) &&
        (a.targetImpressions === 0 || a.impressions < a.targetImpressions)
    );
    if (eligible.length === 0) return res.json(null);
    res.json(eligible[Math.floor(Math.random() * eligible.length)]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Public: register that an ad was actually shown to someone
router.post('/:id/impression', async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: list all campaigns
router.get('/', requireAdmin, async (req, res) => {
  try {
    res.json(await Ad.find().sort({ createdAt: -1 }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: create a campaign (multipart — field "media" is image or video, field "data" is JSON)
router.post('/', requireAdmin, upload.single('media'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    if (!req.file) return res.status(400).json({ error: 'Media fayl shart' });
    const result = await uploadBuffer(req.file.buffer, 'animanxwa/ads', 'auto');
    const doc = await Ad.create({ ...data, mediaUrl: result.secure_url, mediaPublicId: result.public_id });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: edit a campaign
router.put('/:id', requireAdmin, upload.single('media'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    const update = { ...data };
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, 'animanxwa/ads', 'auto');
      update.mediaUrl = result.secure_url;
      update.mediaPublicId = result.public_id;
    }
    const doc = await Ad.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: delete a campaign
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (ad?.mediaPublicId) await deleteByPublicId(ad.mediaPublicId);
    await Ad.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
