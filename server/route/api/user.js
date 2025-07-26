const express = require('express');
const router = express.Router();
const User = require('../../models/Users'); // Adjust path if necessary

// GET /api/user/me - Fetch current user's profile
router.get('/me', async (req, res) => {
  // We'll pass the phone number as a query parameter or in headers from the client
  // For simplicity, let's assume phone is passed as a query param for now.
  // In a real app, you'd use an authentication token to identify the user.
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number is required to fetch user data.' });
  }

  try {
    const user = await User.findOne({ phone }).select('-__v'); // Exclude __v field
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
  const { phone, firstName, lastName, email } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number is required to update user data.' });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found for update.' });
    }

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;

    await user.save(); // Save the updated user

    res.status(200).json({ success: true, message: 'Profile updated successfully!', user: user });
  } catch (err) {
    console.error('Error updating user profile:', err);
    // Handle potential duplicate email error specifically
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ success: false, error: 'Email already exists.' });
    }
    res.status(500).json({ success: false, error: 'Server error updating profile.' });
  }
});

module.exports = router;
