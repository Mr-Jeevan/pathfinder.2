const mongoose = require('mongoose');

const lifeGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  horizonYears: { type: Number, required: true },
  priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
  category: { 
    type: String, 
    enum: ["career", "health", "relationships", "learning", "finance", "personal-growth"],
    required: true 
  },
  linkedTacticalGoals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  status: { type: String, enum: ["active", "paused", "completed"], default: "active" }
}, { timestamps: true });

module.exports = mongoose.model('LifeGoal', lifeGoalSchema);