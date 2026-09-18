const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    photo: { type: String, default: '' },
    email: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeamMember', teamMemberSchema);
