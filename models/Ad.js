const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
  {
    placement: { type: String, enum: ['banner', 'chapter-interstitial'], required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    mediaUrl: { type: String, required: true },
    mediaPublicId: String,
    linkUrl: String,
    targetImpressions: { type: Number, default: 0 }, // 0 = unlimited
    impressions: { type: Number, default: 0 },
    displaySeconds: { type: Number, default: 5 },
    startDate: Date,
    endDate: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ad', adSchema);
