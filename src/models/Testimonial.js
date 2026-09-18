const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    designation: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    quote: { type: String, required: true, trim: true },
    photo: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
