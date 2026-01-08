const OpenAI = require('openai');

function cleanAndParseJSON(text) {
  if (!text) return [];
  try {
    const codeBlockMatch = text.match(/```json([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) return JSON.parse(codeBlockMatch[1].trim());
    
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) return JSON.parse(text.substring(firstBracket, lastBracket + 1));
    
    return JSON.parse(text);
  } catch (e) {
    return [];
  }
}

function getManualFallback(title, durationDays) {
  return [
    {
      title: "Foundations & Setup",
      description: `Establish the core environment for ${title}.`,
      duration: `${Math.ceil(durationDays * 0.1)} days`,
      mentor_tip: "Start small.",
      key_concepts: ["Setup", "Basics"],
      resources: ["Official Docs"]
    },
    {
      title: "Core Execution",
      description: "Build the main features.",
      duration: `${Math.ceil(durationDays * 0.5)} days`,
      mentor_tip: "Focus on functionality.",
      key_concepts: ["Development", "Logic"],
      resources: ["Tutorials"]
    },
    {
      title: "Review & Polish",
      description: "Test and refine your work.",
      duration: `${Math.ceil(durationDays * 0.4)} days`,
      mentor_tip: "Quality over quantity.",
      key_concepts: ["Testing", "Refactoring"],
      resources: ["Checklists"]
    }
  ];
}

async function generateRoadmapAI(title, description, durationDays) {
  const apiKey = process.env.HF_API_KEY; 
  const modelID = process.env.HF_MODEL_ID || "google/gemma-2-9b-it";
  // Default to Router if env is missing
  const baseURL = process.env.HF_BASE_URL || "https://router.huggingface.co/v1/";

  const client = new OpenAI({
    baseURL: baseURL,
    apiKey: apiKey,
  });

  const prompt = `
  Role: Senior Mentor. 
  Task: Create a learning roadmap for "${title}".
  Context: ${description}
  Duration: ${durationDays} days.
  Format: JSON Array ONLY. No Intro.
  Schema: [{"title": "string", "description": "string", "duration": "string", "mentor_tip": "string", "key_concepts": ["string"], "resources": ["string"]}]
  `;

  try {
    const chatCompletion = await client.chat.completions.create({
      model: modelID,
      messages: [
        { role: "system", content: "You output strictly JSON arrays." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const rawContent = chatCompletion.choices[0].message.content;
    const roadmap = cleanAndParseJSON(rawContent);

    if (Array.isArray(roadmap) && roadmap.length > 0) {
      return roadmap;
    }
    throw new Error("Empty AI Response");

  } catch (error) {
    console.error(`AI Roadmap Failed (${modelID}):`, error.message);
    return getManualFallback(title, durationDays);
  }
}

module.exports = { generateRoadmapAI };