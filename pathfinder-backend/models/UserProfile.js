const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // 1. Identity
  ageRange: { type: String },
  educationLevel: { type: String },
  currentRole: { type: String }, // e.g. "Nurse", "Student", "Accountant"
  
  // 2. The Dream
  targetCareer: { type: String }, // NEW: e.g. "Cardiologist", "Game Dev"
  experienceLevel: { type: String }, // NEW: Beginner, Intermediate, Expert
  
  // 3. DNA (Replaces "Preferred Domains")
  workStyle: { type: [String] }, // NEW: "Team Player", "Independent", "Outdoor", "Desk"
  personalityType: { type: String }, // NEW: "Analytical", "Creative", "Social"
  
  // 4. Skills & Values
  strengths: { type: [String] },
  weaknesses: { type: [String] },
  values: { type: [String] }, // Stability, Wealth, Impact...

  // 5. Logistics
  interests: { type: [String] }, 
  constraints: {
    timePerDay: { type: Number },
    budgetPerMonth: { type: Number },
    locationPreference: { type: String }
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);