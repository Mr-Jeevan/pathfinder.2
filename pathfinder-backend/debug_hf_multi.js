const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const token = process.env.HF_API_KEY;
const modelId = process.env.HF_MODEL_ID || "Qwen/Qwen2.5-7B-Instruct";

async function testUrl(url) {
  console.log(`Testing: ${url}`);
  try {
    const response = await axios.post(url, 
      { inputs: "Hello" },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    console.log(`✅ Success: ${url}`);
    return true;
  } catch (err) {
    console.log(`❌ Failed: ${url} -> ${err.response?.status} ${err.response?.statusText}`);
    // console.log(err.response?.data);
    return false;
  }
}

async function run() {
  const urls = [
    `https://router.huggingface.co/hf-inference/models/${modelId}`,
    `https://router.huggingface.co/models/${modelId}`,
    `https://api-inference.huggingface.co/models/${modelId}`, // Retrying just in case
    `https://api-inference.huggingface.co/pipeline/text-generation/${modelId}`
  ];

  for (const url of urls) {
    if (await testUrl(url)) break;
  }
}

run();