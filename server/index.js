const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create an 'uploads' directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Import and mount API routes
const authLoginRoutes = require('./route/auth/login');
const verifyPhoneRoutes = require('./route/auth/verifyPhone');
const userRoutes = require('./route/api/user');
const vehicleRoutes = require('./route/api/vehicle');
const documentRoutes = require('./route/api/document');
const adminRoutes = require('./route/api/admin'); // New: Import admin route

// Mount routes
app.use('/auth', authLoginRoutes);
app.use('/api', verifyPhoneRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/admin', adminRoutes); // New: Mount admin route

// Simple root route to confirm API is running
app.get('/', (req, res) => {
  res.send('API is running!');
});

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Connected ✅');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error ❌', err));
