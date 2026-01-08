const express = require('express');
const router = express.Router();
const OpenAI = require('openai'); 
const authMiddleware = require('../middleware/authMiddleware'); 
const DecisionSession = require('../models/DecisionSession');
const UserProfile = require('../models/UserProfile');
const LifeGoal = require('../models/LifeGoal');
const Goal = require('../models/Goal');
const { recommendNextPaths } = require('../services/pathRecommender');

function cleanAndParseJSON(text) {
  if (!text) return null;
  try {
    const codeBlockMatch = text.match(/```json([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) return JSON.parse(codeBlockMatch[1].trim());
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    return JSON.parse(text);
  } catch (e) { return null; }
}

async function analyzeDecisionLLM(messages) {
  const apiKey = process.env.HF_API_KEY;
  const modelID = process.env.HF_MODEL_ID || "google/gemma-2-9b-it";
  const baseURL = process.env.HF_BASE_URL || "https://router.huggingface.co/v1/";

  const client = new OpenAI({
    baseURL: baseURL,
    apiKey: apiKey,
  });

  try {
    const chatCompletion = await client.chat.completions.create({
      model: modelID,
      messages: messages,
      temperature: 0.6,
      max_tokens: 1500,
    });
    return chatCompletion.choices[0].message.content;
  } catch (err) {
    console.error(`LLM Analysis Error (${modelID}):`, err.message);
    throw new Error("Failed to generate AI analysis");
  }
}

router.post('/analyze', authMiddleware.protect, async (req, res, next) => {
    const { question, options } = req.body;
    if (!question) return res.status(400).json({ message: "Question is required" });
  
    try {
      const userId = req.user.id;
      const [userProfile, lifeGoals, goals] = await Promise.all([
        UserProfile.findOne({ userId }),
        LifeGoal.find({ userId, status: 'active' }),
        Goal.find({ userId, status: { $ne: 'completed' } })
      ]);
      let pathSummary = null;
      if (userProfile && lifeGoals.length > 0) {
        pathSummary = await recommendNextPaths({ userProfile, lifeGoals, goals });
      }
      const contextText = `
      USER PROFILE: Role: ${userProfile?.currentRole || 'N/A'}, Strengths: ${userProfile?.strengths?.join(', ') || 'N/A'}.
      TOP LIFE GOAL: ${lifeGoals[0]?.title || 'None'}.
      `;
      const messages = [
        {
          role: "system",
          content: `You are the "PathFinder Angel." Output ONLY valid JSON. Schema: {"summary": "string", "recommendedOption": "string", "reasoning": "string", "shortTermActions": ["string"], "risks": ["string"]}`
        },
        {
          role: "user",
          content: `CONTEXT:\n${contextText}\n\nDILEMMA: "${question}"\nOPTIONS: ${options ? options.join(', ') : 'Open-ended'}`
        }
      ];
      const rawResponse = await analyzeDecisionLLM(messages);
      let aiAnalysis = cleanAndParseJSON(rawResponse);
      if (!aiAnalysis) {
        aiAnalysis = {
          summary: "Formatting failed.",
          recommendedOption: "Check reasoning.",
          reasoning: rawResponse,
          shortTermActions: ["Manual Review"],
          risks: ["AI formatting error"]
        };
      }
      const decision = new DecisionSession({
        userId,
        question,
        options,
        contextSnapshot: { profile: userProfile },
        aiAnalysis
      });
      await decision.save();
      res.status(201).json({ success: true, decision });
    } catch (err) {
      next(err);
    }
});

router.get('/', authMiddleware.protect, async (req, res, next) => {
  try {
    const decisions = await DecisionSession.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json({ decisions });
  } catch (err) { next(err); }
});

module.exports = router;