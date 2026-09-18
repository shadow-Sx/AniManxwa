const express = require('express');
const Report = require('../models/Report');
const BannedUser = require('../models/BannedUser');
const requireAdmin = require('../middleware/adminAuth');

const router = express.Router();

// Public: submit a complaint (blocked if this device profile is banned)
router.post('/', async (req, res) => {
  try {
    const { userId, nickname, seriesId, seriesTitle, chapterId, chapterLabel, message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'Xabar shart' });
    if (userId) {
      const banned = await BannedUser.findOne({ userId });
      if (banned) return res.status(403).json({ error: 'Siz shikoyat yubora olmaysiz' });
    }
    const doc = await Report.create({ userId, nickname, seriesId, seriesTitle, chapterId, chapterLabel, message });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: list all complaints, newest first, flagged with current ban status
router.get('/', requireAdmin, async (req, res) => {
  try {
    const list = await Report.find().sort({ createdAt: -1 });
    const banned = await BannedUser.find();
    const bannedIds = new Set(banned.map((b) => b.userId));
    res.json(list.map((r) => ({ ...r.toObject(), isBanned: bannedIds.has(r.userId) })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: mark a complaint reviewed
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status || 'reviewed' }, { new: true });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: ban / unban the device profile behind a complaint
router.post('/ban', requireAdmin, async (req, res) => {
  try {
    const { userId, nickname } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId shart' });
    await BannedUser.findOneAndUpdate({ userId }, { userId, nickname }, { upsert: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/unban', requireAdmin, async (req, res) => {
  try {
    await BannedUser.deleteOne({ userId: req.body.userId });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
