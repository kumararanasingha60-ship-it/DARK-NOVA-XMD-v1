const fs = require("fs");
const path = require("path");

// Load environment variables from config.env if it exists
const configPath = path.join(__dirname, "config.env");
if (fs.existsSync(configPath)) {
  require("dotenv").config({ path: configPath });
}

/**
 * Convert string to boolean
 * @param {string} text - The text to convert
 * @param {string} fault - The string to compare against (default "true")
 * @returns {boolean} - The converted boolean value
 */
function convertToBool(text, fault = "true") {
  return text?.toLowerCase() === fault.toLowerCase();
}

module.exports = {
  // Authentication
  SESSION_ID: process.env.SESSION_ID || "",
  
  // Bot Owner
  OWNER_NUM: process.env.OWNER_NUM || "",
  
  // Bot Configuration
  PREFIX: process.env.PREFIX || ".",
  MODE: process.env.MODE || "public",
  
  // Alive Message Settings
  ALIVE_IMG: process.env.ALIVE_IMG || "https://github.com/dula9x/DARK-NOVA-XMD-V1-WEB-PAIR/blob/main/images/WhatsApp%20Image%202025-08-15%20at%2017.22.03_c520eb7b.jpg?raw=true",
  ALIVE_MSG: process.env.ALIVE_MSG || "Iam Alive Now!! ᴅᴀʀᴋ ɴᴏᴠᴀ xᴍᴅ 🤭💗 ආහ් පැටියෝ කොහොමද ?🌝!\n\n🥶ＭＡＤＥ ＢＹ ＡＬＰＨＡ Ｘ ＴＥＡＭ🥶",
  
  // Auto-features
  AUTO_READ_STATUS: convertToBool(process.env.AUTO_READ_STATUS),
  AUTO_VOICE: convertToBool(process.env.AUTO_VOICE),
  AUTO_STICKER: convertToBool(process.env.AUTO_STICKER),
  AUTO_REPLY: convertToBool(process.env.AUTO_REPLY),
  
  // API Keys
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  MOVIE_API_KEY: process.env.MOVIE_API_KEY || ""
};
