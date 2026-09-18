const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    requirement: { type: String, trim: true, default: '' },
    serviceRequired: { type: String, trim: true, default: '' },
    timeline: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    status: {
      type: String,
      enum: ['NEW', 'SCHEDULED', 'DISCUSSED', 'PROPOSAL', 'CLOSED'],
      default: 'NEW'
    },
    scheduledAt: { type: Date, default: null },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
