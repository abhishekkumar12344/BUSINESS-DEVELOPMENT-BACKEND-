const mongoose = require('mongoose');

const approachStepSchema = new mongoose.Schema(
  {
    number: { type: String, default: '01' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    detail: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ApproachStep', approachStepSchema);
