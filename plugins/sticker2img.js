const { cmd } = require("../command");
const { Sticker } = require("wa-sticker-formatter");
const { downloadMediaMessage } = require("../lib/msg.js");
const fs = require("fs-extra"); // Using fs-extra for better file operations

cmd({
    pattern: "toimg",
    alias: ["img", "photo", "stickertoimg"],
    desc: "Convert a sticker to an image",
    category: "utility",
    filename: __filename,
    react: "🖼️"
}, async (robin, mek, m, { from, quoted, reply }) => {
    try {
        // Check if the message contains a sticker to convert
        if (!quoted || !quoted.message?.stickerMessage) {
            return reply("❌ Please reply to a sticker message to convert it to an image.");
        }

        // Temporary file paths
        const tempDir = './temp';
        const inputPath = path.join(tempDir, `sticker_${Date.now()}.webp`);
        const outputPath = path.join(tempDir, `image_${Date.now()}.jpg`);

        // Ensure temp directory exists
        await fs.ensureDir(tempDir);

        // Download the sticker
        const stickerBuffer = await downloadMediaMessage(quoted, "buffer");
        if (!stickerBuffer || stickerBuffer.length === 0) {
            return reply("❌ Failed to download the sticker. Please try again.");
        }

        // Save sticker to temporary file
        await fs.writeFile(inputPath, stickerBuffer);

        // Convert using wa-sticker-formatter
        const sticker = new Sticker(inputPath, {
            pack: "Converted by DARK-NOVA-XMD",
            author: "WhatsApp Bot",
            quality: 90,
            type: "full"
        });

        // Get image buffer
        const imageBuffer = await sticker.toBuffer({ 
            format: "image/jpeg",
            background: "white" // Ensure transparent stickers have background
        });

        // Save output image
        await fs.writeFile(outputPath, imageBuffer);

        // Send the converted image
        await robin.sendMessage(from, {
            image: fs.readFileSync(outputPath),
            caption: "✅ Sticker converted to image!\n_Converted by DARK-NOVA-XMD_",
            mimetype: "image/jpeg"
        }, { quoted: mek });

        // Clean up temporary files
        await fs.remove(inputPath).catch(console.error);
        await fs.remove(outputPath).catch(console.error);

    } catch (error) {
        console.error("Sticker conversion error:", error);
        reply(`❌ Error converting sticker: ${error.message}`);
        
        // Clean up any remaining files
        if (inputPath) await fs.remove(inputPath).catch(console.error);
        if (outputPath) await fs.remove(outputPath).catch(console.error);
    }
});
