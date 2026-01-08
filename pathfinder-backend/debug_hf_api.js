const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from current directory
dotenv.config();

console.log("HF_API_KEY:", process.env.HF_API_KEY ? "Found (starts with " + process.env.HF_API_KEY.substring(0,4) + ")" : "MISSING");
console.log("HF_MODEL_ID:", process.env.HF_MODEL_ID);

async function testHF() {
  const token = process.env.HF_API_KEY;
  const modelId = process.env.HF_MODEL_ID || "Qwen/Qwen2.5-7B-Instruct";
  const modelUrl = `https://api-inference.huggingface.co/models/${modelId}`;

  console.log(`\nTesting Model URL: ${modelUrl}`);

  try {
    const response = await axios.post(modelUrl, 
      { 
        inputs: "Hello, simply reply with 'Working'.", 
        parameters: { max_new_tokens: 10 } 
      },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    console.log("✅ Success! Response:", JSON.stringify(response.data));
  } catch (err) {
    console.error("❌ Error Status:", err.response?.status);
    console.error("❌ Error Data:", JSON.stringify(err.response?.data));
    console.error("❌ Error Message:", err.message);
  }
}

testHF();
