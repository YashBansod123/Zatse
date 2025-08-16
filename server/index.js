const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const app = express();
const PORT = 5000;

// Configure Passport.js to serialize and deserialize users
// This is required for session management
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Use Google OAuth 2.0 Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const User = require('./models/Users'); 
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        googleId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        phone: '', // Phone number can be added later
        role: ['rider'], // Default role
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Import and mount API routes
const authLoginRoutes = require('./route/auth/login');
const verifyPhoneRoutes = require('./route/auth/verifyPhone');
const userRoutes = require('./route/api/user');
const vehicleRoutes = require('./route/api/vehicle');
const documentRoutes = require('./route/api/document');
const adminRoutes = require('./route/api/admin');
const driverRoutes = require('./route/api/driver');
// The 'admin-delete' route is not a real file in your project, so we'll remove it.

// Mount routes
app.use('/auth', authLoginRoutes);
app.use('/api', verifyPhoneRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/admin', adminRoutes);
// Remove the mount for the non-existent 'admin-delete' route.
// app.use('/api/admin', adminDeleteRoutes);
app.use('/api/driver', driverRoutes);


// Google Auth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // On successful login, redirect to a client-side page
    // and pass user data via query or session
    res.redirect(`http://localhost:3000/profile?userId=${req.user._id}`);
  }
);
app.get('/auth/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});


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
