const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  // The User ID this vehicle belongs to
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference the User model
    required: true,
  },
  // The type of vehicle (e.g., 'car', 'bike', 'auto')
  type: {
    type: String,
    required: true,
    enum: ['car', 'bike', 'auto_rickshaw', 'truck', 'bus', 'commercial_car', 'motorbike', 'commercial_motorbike', 'commercial_truck', 'commercial_bus'],
  },
  make: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  // Vehicle status (e.g., 'pending', 'active', 'inactive')
  status: {
    type: String,
    default: 'pending', // Pending verification
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
