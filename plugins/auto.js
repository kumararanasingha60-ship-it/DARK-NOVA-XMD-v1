const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd } = require('../command');

// Helper function to read JSON files safely
const readJsonFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        return {};
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return {};
    }
};

// Auto Voice Response
cmd({
    on: "body"
}, async (robin, mek, m, { from, body }) => {
    if (config.AUTO_VOICE !== 'true') return;

    const filePath = path.join(__dirname, '../data/autovoice.json');
    const data = readJsonFile(filePath);
    
    for (const text in data) {
        if (body.toLowerCase().includes(text.toLowerCase())) {
            try {
                await robin.sendPresenceUpdate('recording', from);
                await robin.sendMessage(
                    from, 
                    { 
                        audio: { url: data[text] }, 
                        mimetype: 'audio/mpeg', 
                        ptt: true 
                    }, 
                    { quoted: mek }
                );
            } catch (error) {
                console.error('Auto voice error:', error);
            }
            break; // Stop after first match
        }
    }
});

// Auto Sticker Response
cmd({
    on: "body"
}, async (robin, mek, m, { from, body }) => {
    if (config.AUTO_STICKER !== 'true') return;

    const filePath = path.join(__dirname, '../data/autosticker.json');
    const data = readJsonFile(filePath);
    
    for (const text in data) {
        if (body.toLowerCase().includes(text.toLowerCase())) {
            try {
                await robin.sendMessage(
                    from,
                    {
                        sticker: { url: data[text] },
                        isAnimated: true
                    },
                    { quoted: mek }
                );
            } catch (error) {
                console.error('Auto sticker error:', error);
            }
            break; // Stop after first match
        }
    }
});

// Auto Reply Response
cmd({
    on: "body"
}, async (robin, mek, m, { from, body }) => {
    if (config.AUTO_REPLY !== 'true') return;

    const filePath = path.join(__dirname, '../data/autoreply.json');
    const data = readJsonFile(filePath);
    
    for (const text in data) {
        if (body.toLowerCase().includes(text.toLowerCase())) {
            try {
                await m.reply(data[text]);
            } catch (error) {
                console.error('Auto reply error:', error);
            }
            break; // Stop after first match
        }
    }
});
