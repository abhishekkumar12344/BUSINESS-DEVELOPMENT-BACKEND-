const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Case studies / project records. Nothing is pre-filled with invented results -
 * every project here is created by an admin from the CMS.
 */
const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    client: { type: String, trim: true, default: '' },
    sector: { type: String, trim: true, default: '' },
    serviceType: { type: String, trim: true, default: '' },
    summary: { type: String, trim: true, default: '' },
    challenge: { type: String, trim: true, default: '' },
    approach: { type: String, trim: true, default: '' },
    outcome: { type: String, trim: true, default: '' },
    coverImage: { type: String, default: '' },
    gallery: [{ type: String }],
    status: { type: String, enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'], default: 'ACTIVE' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

projectSchema.pre('validate', function makeSlug() {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString().slice(-4);
  }
});

module.exports = mongoose.model('Project', projectSchema);
