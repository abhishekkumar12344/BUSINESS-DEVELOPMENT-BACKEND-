const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    service: { type: String, trim: true, default: '' },
    message: { type: String, required: true, trim: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    isRead: { type: Boolean, default: false },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
