const express = require('express');
const router = express.Router();
const User = require('../../models/Users'); // Import the User model
const Vehicle = require('../../models/Vehicle'); // Import the Vehicle model

// POST /api/vehicle - Saves new vehicle details
router.post('/', async (req, res) => {
  const { userId, type, make, model, licensePlate, color } = req.body;

  // Basic validation
  if (!userId || !type || !make || !model || !licensePlate || !color) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  try {
    // Check if a vehicle with this license plate already exists
    const existingVehicle = await Vehicle.findOne({ licensePlate });
    if (existingVehicle) {
      return res.status(409).json({ success: false, error: 'Vehicle with this license plate already exists.' });
    }
    
    // Find the user and check if they already have a vehicle
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    if (user.vehicle) {
      return res.status(409).json({ success: false, error: 'User already has a vehicle associated.' });
    }

    // Create the new vehicle
    const newVehicle = new Vehicle({
      owner: userId,
      type,
      make,
      model,
      licensePlate,
      color,
    });

    await newVehicle.save();

    // Associate the new vehicle with the user
    user.vehicle = newVehicle._id;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle details saved and associated with user successfully.',
      vehicle: newVehicle,
    });
  } catch (err) {
    console.error('Error saving vehicle details:', err);
    res.status(500).json({ success: false, error: 'Server error while saving vehicle details.' });
  }
});

module.exports = router;
