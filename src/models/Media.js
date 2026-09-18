const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    fileName: { type: String, required: true },
    originalName: { type: String, default: '' },
    url: { type: String, required: true },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    folder: { type: String, default: 'general' },
    altText: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);
