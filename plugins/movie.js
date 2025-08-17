const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

const API_URL = "https://api.skymansion.site/movies-dl/search";
const DOWNLOAD_URL = "https://api.skymansion.site/movies-dl/download";
const API_KEY = config.MOVIE_API_KEY;

cmd({
    pattern: "movie",
    alias: ["moviedl", "films"],
    react: '🎬',
    category: "download",
    desc: "Search and download movies from PixelDrain",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q || q.trim() === '') return await reply('❌ Please provide a movie name! (e.g., Deadpool)');

        // Fetch movie search results
        const searchUrl = `${API_URL}?q=${encodeURIComponent(q)}&api_key=${API_KEY}`;
        let response = await fetchJson(searchUrl);

        if (!response?.SearchResult?.result?.length) {
            return await reply(`❌ No results found for: *${q}*`);
        }

        const selectedMovie = response.SearchResult.result[0]; // Select first result
        const detailsUrl = `${DOWNLOAD_URL}/?id=${selectedMovie.id}&api_key=${API_KEY}`;
        let detailsResponse = await fetchJson(detailsUrl);

        if (!detailsResponse?.downloadLinks?.result?.links?.driveLinks?.length) {
            return await reply('❌ No PixelDrain download links found.');
        }

        // Select the 480p PixelDrain link
        const pixelDrainLinks = detailsResponse.downloadLinks.result.links.driveLinks;
        const selectedDownload = pixelDrainLinks.find(link => link.quality === "SD 480p");
        
        if (!selectedDownload?.link?.startsWith('http')) {
            return await reply('❌ No valid 480p PixelDrain link available.');
        }

        // Convert to direct download link
        const urlParts = selectedDownload.link.split('/');
        const fileId = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
        if (!fileId) {
            return await reply('❌ Could not extract file ID from download link.');
        }
        
        const directDownloadLink = `https://pixeldrain.com/api/file/${fileId}?download`;
        
        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, '../temp');
        await fs.ensureDir(tempDir);
        
        const fileName = `${selectedMovie.title.replace(/[^a-z0-9]/gi, '_')}-480p.mp4`;
        const filePath = path.join(tempDir, fileName);
        const writer = fs.createWriteStream(filePath);
        
        const { data } = await axios({
            url: directDownloadLink,
            method: 'GET',
            responseType: 'stream',
            timeout: 30000 // 30 seconds timeout
        });

        data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await robin.sendMessage(from, {
            document: fs.readFileSync(filePath),
            mimetype: 'video/mp4',
            fileName: fileName,
            caption: `🎬 *${selectedMovie.title}*\n📌 Quality: 480p\n✅ *Download Complete!*`,
            quoted: mek 
        });

        await fs.unlink(filePath);
        
    } catch (error) {
        console.error('Error in movie command:', error);
        await reply('❌ Sorry, something went wrong. Please try again later.');
        
        // Clean up if file exists
        if (filePath && await fs.pathExists(filePath)) {
            await fs.unlink(filePath).catch(console.error);
        }
    }
});
