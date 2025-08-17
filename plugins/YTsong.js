const { cmd } = require("../command");
const yts = require("yt-search");
const { ytmp3 } = require("@scrappy-scraper/youtube_scraper");

cmd(
  {
    pattern: "song",
    react: "🎵",
    desc: "Download Song",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*නමක් හරි ලින්ක් එකක් හරි දෙන්න* 🌚❤️");

      // Search for the video
      const search = await yts(q);
      if (!search.videos || search.videos.length === 0) {
        return reply("*No videos found for your query* ❌");
      }
      
      const data = search.videos[0];
      const url = data.url;

      // Song metadata description
      let desc = `
*❤️ DARK-NOVA-XMD SONG DOWNLOADER ❤️*

🎵 *Title*: ${data.title}
📝 *Description*: ${data.description.substring(0, 100)}${data.description.length > 100 ? '...' : ''}
⏱️ *Duration*: ${data.timestamp}
📅 *Uploaded*: ${data.ago}
👀 *Views*: ${data.views}
🔗 *URL*: ${data.url}

ＭＡＤＥ ＢＹ ＡＬＰＨＡ Ｘ ＴＥＡＭ
`;

      // Send metadata thumbnail message
      await robin.sendMessage(
        from,
        { 
          image: { url: data.thumbnail }, 
          caption: desc 
        },
        { quoted: mek }
      );

      // Validate song duration (limit: 30 minutes)
      const durationParts = data.timestamp.split(":").map(Number);
      let totalSeconds = 0;
      
      if (durationParts.length === 3) {
        totalSeconds = durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2];
      } else if (durationParts.length === 2) {
        totalSeconds = durationParts[0] * 60 + durationParts[1];
      }

      if (totalSeconds > 1800) {
        return reply("⏱️ Audio limit is 30 minutes");
      }

      // Download the audio using @vreden/youtube_scraper
      const quality = "128"; // Default quality
      const songData = await ytmp3(url, quality);
      
      if (!songData || !songData.download || !songData.download.url) {
        return reply("❌ Failed to download audio");
      }

      // Send audio file
      await robin.sendMessage(
        from,
        {
          audio: { 
            url: songData.download.url 
          },
          mimetype: "audio/mpeg",
          fileName: `${data.title}.mp3`.replace(/[^\w\s.-]/gi, ''),
        },
        { quoted: mek }
      );

      return reply("*Thanks for using DARK-NOVA-XMD* 🌚❤️");
    } catch (e) {
      console.error("Error in song command:", e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
