const mongoose = require('mongoose');
const slugify = require('slugify');

const serviceSchema = new mongoose.Schema(
  {
    number: { type: String, default: '01' },
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    summary: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    points: [{ type: String, trim: true }],
    outcomes: [{ type: String, trim: true }],
    icon: { type: String, default: '' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' }
  },
  { timestamps: true }
);

serviceSchema.pre('validate', function makeSlug() {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Service', serviceSchema);
