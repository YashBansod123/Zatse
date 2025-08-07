const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Document = require('../../models/Document');
const User = require('../../models/Users');

// Set up Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be saved in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Save files with a unique name to prevent overwrites
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Define the file filter to accept specific file types (e.g., images, PDFs)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: fileFilter,
});

// POST /api/document - Handles multi-file upload
router.post('/', upload.fields([
  { name: 'driverLicense', maxCount: 1 },
  { name: 'vehicleRC', maxCount: 1 },
  { name: 'vehicleInsurance', maxCount: 1 },
  { name: 'vehiclePhotos', maxCount: 5 }, // Allow up to 5 photos
]), async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ success: false, error: 'User ID is required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const uploadedDocuments = [];
    const files = req.files;

    // Process single-file fields
    if (files.driverLicense) {
      const doc = new Document({
        owner: userId,
        type: 'driverLicense',
        fileName: files.driverLicense[0].filename,
        filePath: files.driverLicense[0].path,
      });
      await doc.save();
      uploadedDocuments.push(doc._id);
    }

    if (files.vehicleRC) {
      const doc = new Document({
        owner: userId,
        type: 'vehicleRC',
        fileName: files.vehicleRC[0].filename,
        filePath: files.vehicleRC[0].path,
      });
      await doc.save();
      uploadedDocuments.push(doc._id);
    }

    if (files.vehicleInsurance) {
      const doc = new Document({
        owner: userId,
        type: 'vehicleInsurance',
        fileName: files.vehicleInsurance[0].filename,
        filePath: files.vehicleInsurance[0].path,
      });
      await doc.save();
      uploadedDocuments.push(doc._id);
    }
    
    // Process multiple-file fields (vehicle photos)
    if (files.vehiclePhotos) {
      for (const file of files.vehiclePhotos) {
        const doc = new Document({
          owner: userId,
          type: 'vehiclePhoto',
          fileName: file.filename,
          filePath: file.path,
        });
        await doc.save();
        uploadedDocuments.push(doc._id);
      }
    }

    // Link documents to the user
    user.documents = user.documents.concat(uploadedDocuments);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Documents uploaded and submitted for verification.',
      documents: uploadedDocuments,
    });

  } catch (err) {
    console.error('Error uploading documents:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
