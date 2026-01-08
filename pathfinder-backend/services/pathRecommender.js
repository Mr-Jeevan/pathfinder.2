const OpenAI = require('openai'); 

async function generatePathRationaleLLM({ userProfile, lifeGoals, recommendedGoals }) {
  const apiKey = process.env.HF_API_KEY;
  const modelID = process.env.HF_MODEL_ID || "google/gemma-2-9b-it";
  const baseURL = process.env.HF_BASE_URL || "https://router.huggingface.co/v1/";

  if (!apiKey) return "Based on your profile, these steps fit your goals.";

  const client = new OpenAI({
    baseURL: baseURL,
    apiKey: apiKey,
  });

  const topLifeGoal = lifeGoals[0]?.title || "personal growth";
  const recTitles = recommendedGoals.map(g => g.title).join(", ");
  
  const messages = [
    { role: "system", content: "You are a mentor. Keep it under 3 sentences." },
    { role: "user", content: `Explain why I should focus on: ${recTitles} given my goal: ${topLifeGoal}` }
  ];

  try {
    const chatCompletion = await client.chat.completions.create({
      model: modelID,
      messages: messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    return chatCompletion.choices[0].message.content;
  } catch (err) {
    console.error(`LLM Rationale Error (${modelID}):`, err.message);
    return "Based on your profile, these steps fit your goals.";
  }
}

async function recommendNextPaths({ userProfile, lifeGoals, goals }) {
  let focusArea = "balanced";
  const highPriority = lifeGoals.find(lg => lg.priority === "high");
  if (highPriority) focusArea = highPriority.category;

  const recommendedGoals = [];
  const domains = userProfile.preferredDomains || [];
  
  if (focusArea === "career" || focusArea === "learning") {
    if (domains.includes("backend")) {
      recommendedGoals.push({
        title: "Master API Architecture",
        description: "Design a RESTful API using Node.js.",
        suggestedLinkedLifeGoalId: highPriority?._id || null,
        reasonTag: "aligns_with_domain_expertise"
      });
    } else if (domains.includes("ai-ml")) {
      recommendedGoals.push({
        title: "Fine-tune a Small Language Model",
        description: "Explore Hugging Face Transformers.",
        suggestedLinkedLifeGoalId: highPriority?._id || null,
        reasonTag: "technical_skill_upshift"
      });
    }
  }

  if(recommendedGoals.length === 0) {
      recommendedGoals.push({
          title: "Strategic Planning Session",
          description: "Review your long-term goals and adjust your daily schedule.",
          suggestedLinkedLifeGoalId: null,
          reasonTag: "general_alignment"
      });
  }

  const finalRecs = recommendedGoals.slice(0, 3);
  const rationale = await generatePathRationaleLLM({ userProfile, lifeGoals, recommendedGoals: finalRecs });

  return { focusArea, recommendedGoals: finalRecs, rationale };
}

module.exports = { recommendNextPaths };