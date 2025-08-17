const { cmd } = require("../command");
const getFbVideoInfo = require("fb-downloader-scrapper").default;

cmd(
  {
    pattern: "fb",
    alias: ["facebook"],
    react: "💀",
    desc: "Download Facebook Video",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, reply }
  ) => {
    try {
      if (!q) return reply("*Please provide a valid Facebook video URL!* 🌚❤️");

      // Validate the Facebook URL format
      const fbRegex = /(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/;
      if (!fbRegex.test(q)) {
        return reply("*Invalid Facebook URL! Please check and try again.* 🌚");
      }

      // Fetch video details
      await reply("*Downloading your video...* 🌚❤️");

      const result = await getFbVideoInfo(q);

      if (!result || (!result.sd && !result.hd)) {
        return reply("*Failed to download video. Please try again later.* 🌚");
      }

      const { title, sd, hd } = result;

      // Prepare and send the message with video details
      const desc = `
*❤️ DARK-NOVA-XMD FB VIDEO DOWNLOADER ❤️*

📌 *Title*: ${title || "Unknown"}
🖥 *Quality*: ${hd ? "HD Available" : "SD Only"}

ＭＡＤＥ ＢＹ ＡＬＰＨＡ Ｘ ＴＥＡＭ
      `;

      // Send thumbnail image
      await robin.sendMessage(
        from,
        {
          image: {
            url: "https://github.com/dula9x/DARK-NOVA-XMD-V1-WEB-PAIR/raw/main/images/WhatsApp%20Image%202025-08-15%20at%2017.22.03_c520eb7b.jpg",
          },
          caption: desc,
        },
        { quoted: mek }
      );

      // Send videos
      const sendVideo = async (url, quality) => {
        try {
          await robin.sendMessage(
            from,
            { 
              video: { url }, 
              caption: `----------${quality} VIDEO----------`,
              fileName: `${title || 'facebook_video'}_${quality}.mp4`.replace(/[^\w\s.-]/gi, '')
            },
            { quoted: mek }
          );
        } catch (error) {
          console.error(`Error sending ${quality} video:`, error);
        }
      };

      if (hd) await sendVideo(hd, "HD");
      if (sd) await sendVideo(sd, "SD");

      return reply("*Thanks for using DARK-NOVA-XMD* 🌚❤️");
    } catch (e) {
      console.error("Facebook download error:", e);
      reply(`*Error:* ${e.message || "Failed to process your request"}`);
    }
  }
);
