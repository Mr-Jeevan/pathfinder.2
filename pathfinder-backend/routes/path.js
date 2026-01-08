const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const LifeGoal = require('../models/LifeGoal');
const Goal = require('../models/Goal');
const { recommendNextPaths } = require('../services/pathRecommender');
const {protect: authMiddleware} = require('../middleware/authMiddleware');

router.get('/recommend', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userProfile = await UserProfile.findOne({ userId });
    const lifeGoals = await LifeGoal.find({ userId, status: "active" });
    const goals = await Goal.find({ userId, status: { $ne: "completed" } });

    if (!userProfile || lifeGoals.length === 0) {
      return res.json({
        profileExists: !!userProfile,
        lifeGoalsCount: lifeGoals.length,
        focusArea: null,
        recommendedGoals: [],
        rationale: null,
        message: "Complete your profile and add at least one Life Goal to get personalized path suggestions."
      });
    }

    const recommendations = await recommendNextPaths({ userProfile, lifeGoals, goals });
    
    res.json({
      profileExists: true,
      lifeGoalsCount: lifeGoals.length,
      ...recommendations
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;