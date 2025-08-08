const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
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
  // 👉 NEW: Change role to an array of strings
  role: {
    type: [String], // This is the key change
    enum: ['rider', 'pending_driver', 'driver', 'admin'],
    default: ['rider'], // Default role is now an array with one value
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.index({ phone: 1 });
UserSchema.index({ googleId: 1 });

module.exports = mongoose.model('User', UserSchema);
