const express = require('express');
const router = express.Router();
const User = require('../../models/Users'); // Assuming this path is correct for your User model

router.post('/login', async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required' });

  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
      await user.save();
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
