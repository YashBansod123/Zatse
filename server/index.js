const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

// Import and mount API routes
const authLoginRoutes = require('./route/auth/login');
const verifyPhoneRoutes = require('./route/auth/verifyPhone');
const userRoutes = require('./route/api/user');
const vehicleRoutes = require('./route/api/vehicle'); // New: Import the vehicle route

// Mount routes
app.use('/auth', authLoginRoutes);
app.use('/api', verifyPhoneRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vehicle', vehicleRoutes); // New: Mount the vehicle route

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
