const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: String,
    nickname: String,
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series' },
    seriesTitle: String,
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    chapterLabel: String,
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'reviewed'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
