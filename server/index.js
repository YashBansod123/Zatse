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
const authLoginRoutes = require('./route/auth/login'); // Handles user creation/login
const verifyPhoneRoutes = require('./route/auth/verifyPhone'); // Twilio OTP routes
const userRoutes = require('./route/api/user'); // NEW: User profile routes

// Mount routes
app.use('/auth', authLoginRoutes); // Login route: http://localhost:5000/auth/login
app.use('/api', verifyPhoneRoutes); // OTP routes: http://localhost:5000/api/send-otp, /api/verify-otp
app.use('/api/user', userRoutes); // NEW: User profile routes: http://localhost:5000/api/user/me

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
