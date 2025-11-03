const express = require('express');
const router = express.Router();
const Vehicle = require('../../models/Vehicle');
const User = require('../../models/Users');
const mongoose = require('mongoose'); // IMPORT MONGOOSE HERE

// Placeholder for real authentication middleware (verifies x-user-id header)
const authMiddleware = async (req, res, next) => {
    const userId = req.headers['x-user-id']; 

    if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: User ID missing.' });
    }
    
    try {
        // FIX 1: Use findById to verify user and get the object
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }
        req.user = user;
        next();
    } catch (err) {
        // Catches errors like invalid ObjectId format in the header
        res.status(500).json({ success: false, error: 'Authentication failed.' });
    }
};

// ------------------------------------------------------------------
// 1. GET /api/vehicle/me - Fetch a driver's vehicle details
// ------------------------------------------------------------------
router.get('/me', authMiddleware, async (req, res) => {
    const userId = req.user._id;

    try {
        // FIX 2: Use mongoose.Types.ObjectId to ensure the ID passed to the query is treated as an ObjectId.
        // This resolves any potential string vs. ObjectId comparison bug.
        const vehicle = await Vehicle.findOne({ owner: new mongoose.Types.ObjectId(userId) });

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle details not found for this user.' });
        }

        res.status(200).json({ success: true, vehicle });
    } catch (err) {
        console.error('Error fetching vehicle details:', err);
        res.status(500).json({ success: false, error: 'Server error fetching vehicle details.' });
    }
});


// ------------------------------------------------------------------
// 2. POST /api/vehicle - Saves new vehicle details (from onboarding form)
// ------------------------------------------------------------------
router.post('/', async (req, res) => {
    const { owner, type, make, model, licensePlate, color } = req.body;
    const userId = owner;

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
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }
        
        // Check if user already has a vehicle 
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

        // Associate the new vehicle with the user and set role to pending
        user.vehicle = newVehicle._id;
        
        // Ensure user is marked as pending_driver only if they are not already a driver/admin
        if (!user.role.includes('driver') && !user.role.includes('admin') && !user.role.includes('pending_driver')) {
             user.role.push('pending_driver');
        }
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