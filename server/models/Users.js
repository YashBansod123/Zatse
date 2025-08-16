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
  // The 'role' field is correctly an array of strings
  role: {
    type: [String],
    enum: ['rider', 'pending_driver', 'driver', 'admin'],
    default: ['rider'],
  },
  // The 'status' field is correctly defined for drivers
  status: {
    type: String,
    enum: ['offline', 'online', 'on_trip'],
    default: 'offline',
  },
  // The 'location' field is correctly defined for real-time updates
  location: {
    type: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.index({ phone: 1 });
UserSchema.index({ googleId: 1 });

module.exports = mongoose.model('User', UserSchema);
