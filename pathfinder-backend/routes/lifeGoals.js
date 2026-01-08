const express = require('express');
const router = express.Router();
const LifeGoal = require('../models/LifeGoal');
const { protect: authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    // Debug: Log the incoming user and body to find why it crashes
    console.log("Creating Life Goal for User:", req.user?.id);
    console.log("Incoming Data:", req.body);

    // 1. Check if user exists (Fixes potential 'id of undefined' error)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authorized, user ID missing" });
    }

    // 2. Explicitly handle horizonYears (Ensures it's a Number)
    const goalData = {
      ...req.body,
      userId: req.user.id,
      horizonYears: Number(req.body.horizonYears) || 5 // Cast to Number
    };

    const lifeGoal = new LifeGoal(goalData);
    await lifeGoal.save();
    res.status(201).json({ success: true, lifeGoal });
  } catch (err) {
    // 3. Log the REAL error to your backend terminal
    console.error("CRITICAL ERROR IN POST /LIFE-GOALS:", err.message);
    
    // Check for Mongoose validation errors (like invalid category)
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    
    next(err); 
  }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const lifeGoals = await LifeGoal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ lifeGoals });
  } catch (err) { 
    console.error("GET LifeGoals Error:", err.message);
    next(err); 
  }
});

// GET by ID, PATCH, and DELETE remain largely the same, but added logging
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await LifeGoal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ message: "Goal not found" });
    res.json({ success: true, message: "Life goal deleted" });
  } catch (err) { next(err); }
});

module.exports = router;