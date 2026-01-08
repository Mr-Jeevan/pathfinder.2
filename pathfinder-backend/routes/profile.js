const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/profile
// @desc    Create OR Update "Universal" user profile
router.post('/', protect, async (req, res, next) => {
  try {
    const { 
      // Identity
      ageRange, educationLevel, currentRole,
      // Target
      targetCareer, experienceLevel,
      // DNA
      workStyle, personalityType,
      // Analysis
      interests, strengths, weaknesses, values,
      // Logistics
      constraints 
    } = req.body;

    const profileFields = {
      userId: req.user.id,
      ageRange,
      educationLevel,
      currentRole,
      targetCareer,
      experienceLevel,
      workStyle,        // Assumed Array
      personalityType,  // String
      interests,        // Assumed Array
      strengths,        // Assumed Array
      weaknesses,       // Assumed Array
      values,           // Assumed Array
      constraints
    };

    // Upsert Logic (Create or Update)
    let profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, profile });
  } catch (err) {
    console.error("Profile Save Error:", err.message);
    next(err);
  }
});

// @route   GET /api/profile
router.get('/', protect, async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(200).json({ profile: null });
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

module.exports = router;