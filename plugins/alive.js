const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "alive",
    react: "☑️",
    desc: "Check bot online status",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, reply }) => {
    try {
        // Set bot presence
        await robin.sendPresenceUpdate('recording', from);
        
        // Send audio message
        await robin.sendMessage(
            from, 
            { 
                audio: { 
                    url: "https://github.com/alpha-x-team-ofc/DARK-NOVA-XMD-v1/raw/main/audio/Welcome%20to...mp3" 
                }, 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, 
            { quoted: mek }
        );

        // Send sticker
        await robin.sendMessage(
            from,
            {
                sticker: { 
                    url: "https://github.com/alpha-x-team-ofc/DARK-NOVA-XMD-v1/raw/main/audio/%F0%9F%8E%AC/DN%20(1).webp"
                },
                isAnimated: true
            },
            { quoted: mek }
        );

        // Send alive image with caption
        await robin.sendMessage(
            from,
            {
                image: {url: config.ALIVE_IMG},
                caption: config.ALIVE_MSG
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error("Alive command error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
