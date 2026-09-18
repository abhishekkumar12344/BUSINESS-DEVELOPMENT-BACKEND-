const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedByName: { type: String, default: '' }
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    leadId: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    service: { type: String, trim: true, default: 'General Enquiry' },
    requirement: { type: String, trim: true, default: '' },
    timeline: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '' },
    source: {
      type: String,
      enum: ['CONTACT_FORM', 'CONSULTATION_FORM', 'MANUAL', 'REFERRAL'],
      default: 'CONTACT_FORM'
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'IN_DISCUSSION', 'PROPOSAL', 'COMPLETED', 'CLOSED'],
      default: 'NEW'
    },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: [noteSchema]
  },
  { timestamps: true }
);

// Human readable sequential id: NPBM-2026-0001
leadSchema.pre('save', async function setLeadId(next) {
  if (this.leadId) return next();
  const year = new Date().getFullYear();
  const count = await mongoose.model('Lead').countDocuments({
    createdAt: { $gte: new Date(`${year}-01-01`) }
  });
  this.leadId = `NPBM-${year}-${String(count + 1).padStart(4, '0')}`;
  return next();
});

leadSchema.index({ name: 'text', company: 'text', email: 'text', message: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
