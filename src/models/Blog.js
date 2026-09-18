const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String, trim: true, default: '' },
    content: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: 'Management Insights' },
    tags: [{ type: String, trim: true }],
    coverImage: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, default: 'Nisha Editorial Desk' },
    readTime: { type: String, default: '4 min read' },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    views: { type: Number, default: 0 },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' }
  },
  { timestamps: true }
);

blogSchema.pre('validate', function makeSlug() {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isPublished && !this.publishedAt) this.publishedAt = new Date();
});

module.exports = mongoose.model('Blog', blogSchema);
