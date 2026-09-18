const mongoose = require('mongoose');

const valueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    icon: { type: String, default: 'integrity' },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Value', valueSchema);
