const mongoose = require('mongoose');

const translatorRequestSchema = new mongoose.Schema(
  {
    nickname: String,
    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('TranslatorRequest', translatorRequestSchema);
