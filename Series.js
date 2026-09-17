const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    author: String,
    studio: String,
    year: Number,
    type: { type: String, enum: ['manga', 'manhwa', 'manhua', 'novel'], default: 'manhwa' },
    status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
    payment: { type: String, enum: ['free', 'subscription'], default: 'free' },
    volumes: { type: Number, default: 0 },
    seasons: { type: Number, default: 0 },
    genres: [String],
    coverUrl: String,
    coverPublicId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Series', seriesSchema);
