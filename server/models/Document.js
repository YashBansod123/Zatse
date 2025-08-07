const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['driverLicense', 'vehicleRC', 'vehicleInsurance', 'vehiclePhoto'],
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String, // We'll store the path to the uploaded file
    required: true,
  },
  // Status of the document (e.g., 'pending', 'verified', 'rejected')
  status: {
    type: String,
    default: 'pending',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Document', DocumentSchema);
