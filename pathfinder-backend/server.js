const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import Routes and Middleware
const goalRoutes = require('./routes/goals');
const User = require('./models/User');
const profile = require('./routes/profile');
const lifeGoals =  require('./routes/lifeGoals');
const path =  require('./routes/path');
const decisions = require('./routes/decisions');
const errorHandler = require('./middleware/errorHandler'); // New Enhancement

const app = express();

// Standard Middleware
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Database connection error:", err));

// --- AUTH ROUTES ---
// Note: In a larger app, these would move to routes/auth.js
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ message: "User created" });
  } catch (err) { 
    // Passing error to our custom errorHandler
    next(err); 
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ token, user: { id: user._id, email: user.email } });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    next(err);
  }
});

console.log("Goals Route Type:", typeof goalRoutes);
console.log("Profile Route Type:", typeof profile);
console.log("LifeGoals Route Type:", typeof lifeGoals);
console.log("ErrorHandler Type:", typeof errorHandler);

// Your existing app.use calls follow...


// --- GOAL ROUTES ---
app.use('/api/goals', goalRoutes);

app.use('/api/profile', profile);
app.use('/api/life-goals', lifeGoals);
app.use('/api/path', path);
app.use('/api/decisions', decisions);

// --- GLOBAL ERROR HANDLER ---
// This MUST be the last middleware in the file
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));