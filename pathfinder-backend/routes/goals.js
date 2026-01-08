const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); 
const Goal = require('../models/Goal');
const LifeGoal = require('../models/LifeGoal');
const { generateRoadmapAI } = require('../utils/roadmapGeneratorAI');

// 1. Create a New Goal (with AI Roadmap)
router.post('/', authMiddleware.protect, async (req, res, next) => {
  try {
    const { title, description, targetDate, linkedLifeGoal } = req.body;

    if (!title || !targetDate) {
      return res.status(400).json({ message: "Title and Target Date are required" });
    }

    // Calc Duration
    const start = new Date();
    const end = new Date(targetDate);
    const diffTime = Math.abs(end - start);
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    // Generate AI Roadmap (Returns rich array of steps)
    const aiStepsRaw = await generateRoadmapAI(title, description, durationDays);
    
    // FIX: Map the rich AI data directly to the Mongoose Schema
    const steps = Array.isArray(aiStepsRaw) 
      ? aiStepsRaw.map(step => ({
          title: step.title || "Untitled Step",
          description: step.description || "No description provided.",
          duration: step.duration || "Flexible",
          mentor_tip: step.mentor_tip || "Stay consistent.",
          key_concepts: Array.isArray(step.key_concepts) ? step.key_concepts : [],
          resources: Array.isArray(step.resources) ? step.resources : [],
          completed: false
        }))
      : [];

    // Create Goal Object
    const newGoal = new Goal({
      userId: req.user.id,
      title,
      description,
      targetDate, 
      linkedLifeGoal: linkedLifeGoal || null,
      steps: steps, // Saving the rich steps
      status: 'pending' 
    });

    const savedGoal = await newGoal.save();

    if (linkedLifeGoal) {
      await LifeGoal.findByIdAndUpdate(linkedLifeGoal, { 
        $push: { linkedTacticalGoals: savedGoal._id } 
      });
    }

    res.status(201).json({ success: true, goal: savedGoal });

  } catch (err) {
    console.error("Create Goal Route Error:", err);
    next(err);
  }
});

// 2. Get All Goals
router.get('/', authMiddleware.protect, async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ targetDate: 1 });
    res.json({ goals });
  } catch (err) { next(err); }
});

// 3. Get Single Goal
router.get('/:id', authMiddleware.protect, async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json({ goal });
  } catch (err) { next(err); }
});

// 4. Update Goal
router.patch('/:id', authMiddleware.protect, async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json({ goal });
  } catch (err) { next(err); }
});

// 5. Delete Goal
router.delete('/:id', authMiddleware.protect, async (req, res, next) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Goal deleted" });
  } catch (err) { next(err); }
});

module.exports = router;