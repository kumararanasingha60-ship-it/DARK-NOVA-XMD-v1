const { cmd } = require("../command");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { downloadMediaMessage } = require("../lib/msg.js");

cmd(
  {
    pattern: "sticker",
    alias: ["s", "stick"],
    desc: "Convert images/videos to stickers",
    category: "utility",
    filename: __filename,
    react: "🖼️" // Added emoji reaction
  },
  async (robin, mek, m, { from, quoted, reply }) => {
    try {
      // Check if quoted message exists and contains media
      if (!quoted || !(quoted.imageMessage || quoted.videoMessage)) {
        return reply("❌ Please reply to an image/video to convert to sticker");
      }

      // Download the media with error handling
      let media;
      try {
        media = await downloadMediaMessage(quoted, "stickerInput");
        if (!media) throw new Error("Failed to download media");
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        return reply("⚠️ Failed to download media. Please try again!");
      }

      // Create sticker with enhanced options
      const stickerOptions = {
        pack: "DARK-NOVA-XMD",
        author: "ＭＡＤＥ ＢＹ ＡＬＰＨＡ Ｘ ＴＥＡＭ",
        type: StickerTypes.FULL,
        quality: 70, // Increased quality
        categories: ["🤩", "🎉"], // Added categories for better sticker discovery
        id: Date.now().toString(), // Unique ID
        backgroundColor: "#FFFFFF" // White background
      };

      const sticker = new Sticker(media, stickerOptions);
      const buffer = await sticker.toBuffer();

      // Send sticker with additional metadata
      await robin.sendMessage(
        from,
        { 
          sticker: buffer,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: false
          }
        },
        { quoted: mek }
      );

    } catch (error) {
      console.error("Sticker Error:", error);
      reply(`❌ Error: ${error.message || "Failed to create sticker"}`);
    }
  }
);
