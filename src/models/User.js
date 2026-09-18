const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'PROJECT_MANAGER'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: 'ADMIN' },
    phone: { type: String, trim: true, default: '' },
    designation: { type: String, trim: true, default: '' },
    avatar: { type: String, default: '' },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', userSchema);
