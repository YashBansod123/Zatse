
const mongoose = require('mongoose');
const Vehicle = require('./Vehicle');

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    default: '', // Default to empty string, can be updated later
    trim: true,
  },
  lastName: {
    type: String,
    default: '', // Default to empty string, can be updated later
    trim: true,
  },
  email: {
    type: String,
    default: '', // Default to empty string, can be updated later
    unique: true, // Email should be unique, but allow multiple empty strings
    sparse: true, // Allows multiple documents to have a null or empty string value for a unique field
    trim: true,
    lowercase: true,
  },
  Vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle', // Reference to the Vehicle model
    default: null, // Default to null if no vehicle is associated
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add an index for phone for faster lookups
UserSchema.index({ phone: 1 });

// For the unique sparse index on email, if you want to enforce uniqueness only for non-empty emails
// UserSchema.index({ email: 1 }, { unique: true, sparse: true });
// Note: If you have existing empty strings, you might need to clean data or ensure the default is null for sparse unique to work perfectly.
// For simplicity, we'll keep it as default: '' for now, which means multiple users can have empty emails.
// If you truly need unique non-empty emails, consider making default: null and adding the sparse unique index.

module.exports = mongoose.model('User', UserSchema);
