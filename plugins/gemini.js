const { cmd } = require('../command');
const axios = require("axios");
const config = require('../config');

const GEMINI_API_KEY = config.GEMINI_API_KEY || process.env.GEMINI_API_KEY; // Fallback to environment variable
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

cmd({
  pattern: "gemini",
  alias: ["ai", "chatgpt"],
  react: '🤖',
  desc: "Ask anything to Google Gemini AI",
  category: "ai",
  use: "<question>",
  filename: __filename
}, async (conn, mek, msg, { args, q, reply, pushname }) => {
  try {
    if (!GEMINI_API_KEY) {
      return reply("❌ Gemini API key is not configured");
    }

    const text = q || args.join(" ");
    if (!text) {
      return reply("❗️ Please provide a question");
    }

    const prompt = `My name is ${pushname || "a user"}. Your name is DARK-NOVA-XMD. 
    You are a WhatsApp AI Bot created by Isara Sihilel. 
    Respond in the user's language. Answer conversationally like a human. 
    Use appropriate emojis. Question: ${text}`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8
      }
    };

    const response = await axios.post(
      GEMINI_API_URL,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000 // 15 seconds timeout
      }
    );

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return reply("❌ Failed to get a valid response from Gemini");
    }
    
    const aiResponse = response.data.candidates[0].content.parts[0].text;
    await reply(aiResponse);
    
  } catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      reply("❌ Invalid request to Gemini API");
    } else if (error.response?.status === 403) {
      reply("🔑 Invalid API key for Gemini");
    } else if (error.code === 'ECONNABORTED') {
      reply("⏱️ Request timed out. Please try again");
    } else {
      reply("❌ Error processing your request. Please try again later");
    }
  }
});
