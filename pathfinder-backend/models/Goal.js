const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetDate: { type: Date, required: true },

  // NEW: Fields for the Human-like Mentor Intro and Final Motivation
  mentor_intro: { type: String },
  final_advice: { type: String },

  linkedLifeGoal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LifeGoal',
    required: false
  },

  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },

  // 🔥 UPDATED: Detailed steps array to capture expert content
  steps: [{
    title: { type: String, required: true },
    description: { type: String },    // Detailed tactical instructions
    duration: { type: String },       // e.g., "10-15 hours"
    mentor_tip: { type: String },     // The human-like 'pro-tip'
    key_concepts: [{ type: String }], // Array of tags/concepts
    resources: [{ type: String }],    // Array of links/tools
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);