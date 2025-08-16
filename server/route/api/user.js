const express = require('express');
const router = express.Router();
const User = require('../../models/Users');

// GET /api/user/me - Fetch current user's profile
// Now supports fetching by both phone and userId
router.get('/me', async (req, res) => {
  const { phone, userId } = req.query; // Get both from query params

  // Check if either phone or userId is provided
  if (!phone && !userId) {
    return res.status(400).json({ success: false, error: 'Phone number or User ID is required to fetch user data.' });
  }

  try {
    let user;
    if (userId) {
        user = await User.findById(userId).select('-__v'); // Find user by ID
    } else {
        user = await User.findOne({ phone }).select('-__v'); // Find user by phone
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ success: false, error: 'Server error fetching profile.' });
  }
});

// PUT /api/user/me - Update current user's profile (firstName, lastName, email)
router.put('/me', async (req, res) => {
  const { phone, userId, firstName, lastName, email } = req.body;

  // Check if either phone or userId is provided
  if (!phone && !userId) {
    return res.status(400).json({ success: false, error: 'Phone number or User ID is required to update user data.' });
  }

  try {
    let user;
    if (userId) {
        user = await User.findById(userId);
    } else {
        user = await User.findOne({ phone });
    }
    

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found for update.' });
    }

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;

    await user.save(); // Save the updated user

    res.status(200).json({ success: true, message: 'Profile updated successfully!', user: user });
  } catch (err) {
    console.error('Error updating user profile:', err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ success: false, error: 'Email already exists.' });
    }
    res.status(500).json({ success: false, error: 'Server error updating profile.' });
  }
});

module.exports = router;
