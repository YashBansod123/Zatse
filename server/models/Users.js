const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    default: '',
    trim: true,
  },
  lastName: {
    type: String,
    default: '',
    trim: true,
  },
  email: {
    type: String,
    default: '',
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null,
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  // 👉 NEW: Add a role field
  role: {
    type: String,
    enum: ['rider', 'pending_driver', 'driver', 'admin'],
    default: 'rider', // Default role for new users
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.index({ phone: 1 });

module.exports = mongoose.model('User', UserSchema);
