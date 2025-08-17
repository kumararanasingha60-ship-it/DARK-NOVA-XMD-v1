const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

cmd(
  {
    pattern: "video",
    react: "🎥",
    desc: "Download YouTube Video",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      if (!q) return reply("*Provide a name or a YouTube link.* 🎥❤️");

      // Search for the video
      const search = await yts(q);
      if (!search.videos || search.videos.length === 0) {
        return reply("*No videos found for your query* ❌");
      }
      
      const data = search.videos[0];
      const url = data.url;

      // Video metadata description
      let desc = `🎥 *DARK-NOVA-XMD VIDEO DOWNLOADER* 🎥
      
📌 *Title*: ${data.title}
⏱️ *Duration*: ${data.timestamp}
👀 *Views*: ${data.views}
📅 *Uploaded*: ${data.ago}
👤 *Channel*: ${data.author.name}
🔗 *Link*: ${data.url}

ＭＡＤＥ ＢＹ ＡＬＰＨＡ Ｘ ＴＥＡＭ`;

      // Send metadata and thumbnail message
      await robin.sendMessage(
        from,
        { 
          image: { url: data.thumbnail }, 
          caption: desc 
        },
        { quoted: mek }
      );

      // Video download function
      const downloadVideo = async (url, quality) => {
        const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=${quality}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.success) {
          const { id, title } = response.data;

          // Wait for download URL generation
          const progressUrl = `https://p.oceansaver.in/ajax/progress.php?id=${id}`;
          let attempts = 0;
          const maxAttempts = 10;
          
          while (attempts < maxAttempts) {
            attempts++;
            const progress = await axios.get(progressUrl);
            
            if (progress.data.success && progress.data.progress === 1000) {
              const videoResponse = await axios.get(progress.data.download_url, {
                responseType: "arraybuffer",
              });
              return { buffer: videoResponse.data, title };
            }
            
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
          
          throw new Error("Download took too long to process");
        } else {
          throw new Error("Failed to fetch video details");
        }
      };

      // Specify desired quality (default: 720p)
      const quality = "720";

      // Download and send video
      const video = await downloadVideo(url, quality);
      await robin.sendMessage(
        from,
        {
          video: video.buffer,
          caption: `🎥 *${video.title}*\n\nＭＡＤＥ ＢＹ ＡＬＰＨＡ Ｘ ＴＥＡＭ`,
          fileName: `${video.title}.mp4`.replace(/[^\w\s.-]/gi, '')
        },
        { quoted: mek }
      );

      reply("*Thanks for using DARK-NOVA-XMD* 🎥❤️");
    } catch (e) {
      console.error("Error in video command:", e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
