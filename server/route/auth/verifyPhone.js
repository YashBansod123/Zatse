const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const User = require('../../models/Users'); // Import the User model
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  try {
    const e164Phone = `+91${phone}`; // Ensure this matches the format Twilio expects and your input provides

    // Optional: Check if user exists before sending OTP (good for preventing OTP spam to non-existent users)
    // let user = await User.findOne({ phone });
    // if (!user) {
    //   // If user doesn't exist, you might want to create them here or return an error
    //   // For now, we assume login endpoint handles user creation.
    // }

    const verification = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
      .verifications
      .create({ to: e164Phone, channel: 'sms' });

    res.status(200).json({ success: true, message: 'OTP sent', sid: verification.sid });
  } catch (err) {
    console.error("Twilio send OTP error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;

  try {
    const e164Phone = `+91${phone}`; // Ensure this matches the format Twilio expects and your input provides

    const verification_check = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks
      .create({ to: e164Phone, code });

    if (verification_check.status === "approved") {
      // OTP is approved, now find the user and send their data
      const user = await User.findOne({ phone }); // Find user by phone number

      if (user) {
        res.status(200).json({ success: true, message: 'Phone verified ✅', user: user });
      } else {
        // This case should ideally not happen if user is created at login, but good to handle
        res.status(404).json({ success: false, message: 'User not found after verification.' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP ❌' });
    }
  } catch (err) {
    console.error("Twilio verify OTP error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
