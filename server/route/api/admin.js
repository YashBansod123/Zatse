const express = require('express');
const router = express.Router();
const Document = require('../../models/Document');
const User = require('../../models/Users');

// This is a placeholder for a real admin authentication middleware
// In a real application, you would add a check here to ensure the user is an admin
router.use((req, res, next) => {
  // In a real application, you would check a JWT or a session
  // For this demonstration, we'll check for a hardcoded header
  const adminSecret = req.headers['x-admin-secret'];
  if (adminSecret === 'super-secret-key') { // Use a real key from a .env file
    next();
  } else {
    res.status(401).json({ success: false, error: 'Unauthorized: Admin access required' });
  }
});

// GET /api/admin/documents - Get all unverified documents
router.get('/documents', async (req, res) => {
  try {
    const unverifiedDocs = await Document.find({ status: 'pending' }).populate('owner');
    res.status(200).json({ success: true, documents: unverifiedDocs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error fetching documents.' });
  }
});

// Helper function to check if all of a user's required documents are verified
const checkAndPromoteUser = async (userId) => {
  const requiredDocs = ['driverLicense', 'vehicleRC', 'vehicleInsurance'];
  const user = await User.findById(userId).populate('documents');
  if (!user) return;
  
  const hasAllRequiredDocs = requiredDocs.every(requiredType => 
    user.documents.some(doc => doc.type === requiredType && doc.status === 'verified')
  );
  
  if (hasAllRequiredDocs) {
    user.role = 'driver';
    await user.save();
    console.log(`User ${userId} promoted to driver.`);
  }
};

// PUT /api/admin/documents/:id/verify - Verify a document
router.put('/documents/:id/verify', async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: 'verified' },
      { new: true }
    );
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }
    
    checkAndPromoteUser(document.owner);
    
    res.status(200).json({ success: true, message: 'Document verified.', document });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error verifying document.' });
  }
});

// PUT /api/admin/documents/:id/reject - Reject a document
router.put('/documents/:id/reject', async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }
    
    const user = await User.findById(document.owner);
    if (user && user.role === 'pending_driver') {
      user.role = 'rider';
      await user.save();
    }
    
    res.status(200).json({ success: true, message: 'Document rejected.', document });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error rejecting document.' });
  }
});

module.exports = router;
