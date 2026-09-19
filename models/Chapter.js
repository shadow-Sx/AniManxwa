const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true, index: true },
    season: String,
    volume: String,
    chapter: { type: String, required: true },
    title: String,
    pageCount: { type: Number, default: 0 },
    pages: [
      {
        url: String,
        publicId: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chapter', chapterSchema);
