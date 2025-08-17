const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    jidNormalizedUser, 
    getContentType, 
    fetchLatestBaileysVersion, 
    Browsers 
} = require("@whiskeysockets/baileys");
const { 
    getBuffer, 
    getGroupAdmins, 
    getRandom, 
    h2k, 
    isUrl, 
    Json, 
    runtime, 
    sleep, 
    fetchJson 
} = require("./lib/functions");
const fs = require("fs");
const P = require("pino");
const config = require("./config");
const qrcode = require("qrcode-terminal");
const util = require("util");
const { sms, downloadMediaMessage } = require("./lib/msg");
const axios = require("axios");
const { File } = require("megajs");
const express = require("express");
const path = require("path");

// Initialize global fetch
(async () => { 
    const { default: fetch } = await import('node-fetch'); 
    globalThis.fetch = fetch; 
})();

const prefix = config.PREFIX;
const ownerNumber = config.OWNER_NUM;
const app = express();
const port = process.env.PORT || 8000;

// Session Authentication
async function setupSession() {
    const authDir = path.join(__dirname, "auth_info_baileys");
    const credsFile = path.join(authDir, "creds.json");
    
    if (!fs.existsSync(credsFile)) {
        if (!config.SESSION_ID) {
            console.error("❌ Error: Please add your session to SESSION_ID env");
            process.exit(1);
        }

        try {
            if (!fs.existsSync(authDir)) {
                fs.mkdirSync(authDir, { recursive: true });
            }

            const filer = File.fromURL(`https://mega.nz/file/${config.SESSION_ID}`);
            const data = await new Promise((resolve, reject) => {
                filer.download((err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });

            await fs.promises.writeFile(credsFile, data);
            console.log("✅ Session downloaded successfully");
        } catch (err) {
            console.error("❌ Error downloading session:", err);
            process.exit(1);
        }
    }
}

// WhatsApp Connection
async function connectToWA() {
    await setupSession();

    console.log("🔌 Connecting DARK-NOVA-XMD...");
    const { state, saveCreds } = await useMultiFileAuthState(
        path.join(__dirname, "auth_info_baileys")
    );
    
    const { version } = await fetchLatestBaileysVersion();

    const robin = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version,
    });

    // Event Handlers
    robin.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === "close") {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log("🔁 Reconnecting...");
                setTimeout(connectToWA, 5000);
            } else {
                console.log("❌ Connection closed, please restart the bot");
            }
        } else if (connection === "open") {
            console.log("⚙️ Installing plugins...");
            
            // Load plugins
            const pluginsDir = path.join(__dirname, "plugins");
            fs.readdirSync(pluginsDir).forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() === ".js") {
                    try {
                        require(path.join(pluginsDir, plugin));
                        console.log(`✅ Loaded plugin: ${plugin}`);
                    } catch (err) {
                        console.error(`❌ Failed to load plugin ${plugin}:`, err);
                    }
                }
            });

            console.log("✅ DARK-NOVA-XMD installed successfully");
            console.log("✅ Connected to WhatsApp");

            // Send connection notifications
            try {
                const imageUrl = "https://github.com/dula9x/DARK-NOVA-XMD-V1-WEB-PAIR/blob/main/images/WhatsApp%20Image%202025-08-15%20at%2017.22.03_c520eb7b.jpg?raw=true";
                const imageBuffer = await getBuffer(imageUrl);
                
                await robin.sendMessage(`${ownerNumber}@s.whatsapp.net`, {
                    image: imageBuffer,
                    caption: "DARK-NOVA-XMD connected successfully ✅"
                });
            } catch (err) {
                console.error("Failed to send connection message:", err);
            }
        }
    });

    robin.ev.on("creds.update", saveCreds);

    // Message Handler
    robin.ev.on("messages.upsert", async ({ messages }) => {
        const mek = messages[0];
        if (!mek.message) return;

        // Process message
        mek.message = getContentType(mek.message) === "ephemeralMessage" 
            ? mek.message.ephemeralMessage.message 
            : mek.message;

        // Auto-read status
        if (mek.key?.remoteJid === "status@broadcast" && config.AUTO_READ_STATUS === "true") {
            await robin.readMessages([mek.key]);
        }

        const m = sms(robin, mek);
        const type = getContentType(mek.message);
        const from = mek.key.remoteJid;
        
        // Extract message body
        let body = "";
        switch (type) {
            case "conversation":
                body = mek.message.conversation;
                break;
            case "extendedTextMessage":
                body = mek.message.extendedTextMessage.text;
                break;
            case "imageMessage":
                body = mek.message.imageMessage?.caption || "";
                break;
            case "videoMessage":
                body = mek.message.videoMessage?.caption || "";
                break;
        }

        // Command processing
        const isCmd = body.startsWith(prefix);
        if (isCmd) {
            const [cmdName, ...args] = body.slice(prefix.length).trim().split(/\s+/);
            const q = args.join(" ");
            
            // Get sender info
            const sender = mek.key.fromMe 
                ? robin.user.id 
                : mek.key.participant || mek.key.remoteJid;
            const senderNumber = sender.split("@")[0];
            const isOwner = ownerNumber.includes(senderNumber) || mek.key.fromMe;
            
            // Check access
            if (config.MODE === "private" && !isOwner) return;
            if (config.MODE === "inbox" && !isOwner && from.endsWith("@g.us")) return;
            if (config.MODE === "groups" && !isOwner && !from.endsWith("@g.us")) return;

            // Execute command
            const events = require("./command");
            const cmd = events.commands.find(c => 
                c.pattern === cmdName || 
                (c.alias && c.alias.includes(cmdName))
            );

            if (cmd) {
                try {
                    if (cmd.react) {
                        await robin.sendMessage(from, { 
                            react: { 
                                text: cmd.react, 
                                key: mek.key 
                            } 
                        });
                    }

                    await cmd.function(robin, mek, m, {
                        from,
                        body,
                        command: cmdName,
                        args,
                        q,
                        isOwner,
                        // Add other context as needed
                    });
                } catch (err) {
                    console.error(`[COMMAND ERROR] ${cmdName}:`, err);
                }
            }
        }
    });
}

// Express Server
app.get("/", (req, res) => {
    res.send("DARK-NOVA-XMD is running ✅");
});

app.listen(port, () => {
    console.log(`🌐 Server listening on http://localhost:${port}`);
});

// Start the bot
setTimeout(connectToWA, 4000);
