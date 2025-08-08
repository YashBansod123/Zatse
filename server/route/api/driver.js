const express = require('express');
const router = express.Router();
const User = require('../../models/Users');

// This is a placeholder for a real authentication middleware
// It would verify a JWT token and attach the user object to the request
const authMiddleware = async (req, res, next) => {
    // For this example, we'll assume a userId is sent in the body or headers
    const userId = req.body.userId || req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: User ID missing.' });
    }
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ success: false, error: 'Authentication failed.' });
    }
};

// PUT /api/driver/status - Updates the driver's online status
router.put('/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    const user = req.user;

    // Check if the user has the 'driver' role
    if (!user.role.includes('driver')) {
        return res.status(403).json({ success: false, error: 'Forbidden: Only verified drivers can change their status.' });
    }

    // Validate the new status
    if (!['online', 'offline'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status provided. Must be "online" or "offline".' });
    }

    try {
        user.status = status;
        await user.save();
        res.status(200).json({ success: true, message: `Driver status set to ${status}.` });
    } catch (err) {
        console.error('Error updating driver status:', err);
        res.status(500).json({ success: false, error: 'Server error updating driver status.' });
    }
});

module.exports = router;
