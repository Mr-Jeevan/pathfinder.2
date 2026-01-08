const mongoose = require('mongoose');

const DecisionSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [String], // ["Internship", "Masters", "Startup"]
  
  // Snapshot of what the user's life looked like when they asked
  contextSnapshot: {
    profile: mongoose.Schema.Types.Mixed,
    lifeGoals: [mongoose.Schema.Types.Mixed],
    goals: [mongoose.Schema.Types.Mixed],
    pathSummary: mongoose.Schema.Types.Mixed
  },

  // The AI's structured response
  aiAnalysis: {
    summary: String,
    recommendedOption: String,
    reasoning: String,
    shortTermActions: [String],
    risks: [String]
  },

  userFeedback: {
    helpful: Boolean,
    comment: String
  }
}, { timestamps: true });

module.exports = mongoose.model('DecisionSession', DecisionSessionSchema);