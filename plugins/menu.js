const { cmd, commands } = require("../command");
const config = require('../config');

cmd(
  {
    pattern: "menu",
    alias: ["getmenu", "help", "commands"], // Fixed typo in "alise" and added more aliases
    react: "📜", // Changed to more appropriate emoji
    desc: "Get command list",
    category: "main",
    filename: __filename,
  },
  async (robin, mek, m, { from, pushname, reply }) => { // Simplified parameters
    try {
      // Organize commands by category
      const categorizedCommands = {};
      const categories = ['main', 'download', 'group', 'owner', 'convert', 'search', 'ai', 'fun'];
      
      // Initialize categories
      categories.forEach(cat => {
        categorizedCommands[cat] = [];
      });

      // Sort commands into categories
      commands.forEach(command => {
        if (command.pattern && !command.dontAddCommandList && command.category) {
          if (!categorizedCommands[command.category]) {
            categorizedCommands[command.category] = [];
          }
          categorizedCommands[command.category].push(command);
        }
      });

      // Build menu sections
      const buildSection = (title, commands) => {
        if (!commands || commands.length === 0) return '';
        return `| *${title.toUpperCase()} COMMANDS* |\n` +
          commands.map(cmd => `    ▫️${config.PREFIX}${cmd.pattern}${cmd.desc ? ` - ${cmd.desc}` : ''}`).join('\n') + '\n\n';
      };

      // Generate menu text
      const menuText = `👋 *Hello ${pushname || 'User'}* \n\n` +
        buildSection('Main', categorizedCommands.main) +
        buildSection('Download', categorizedCommands.download) +
        buildSection('Group', categorizedCommands.group) +
        buildSection('Owner', categorizedCommands.owner) +
        buildSection('Convert', categorizedCommands.convert) +
        buildSection('Search', categorizedCommands.search) +
        buildSection('AI', categorizedCommands.ai) +
        buildSection('Fun', categorizedCommands.fun) +
        `\n⚡ *${config.BOTNAME}* - Powered by ALPHA X TEAM\n` +
        `> Type ${config.PREFIX}help <command> for more info`;

      // Send menu
      await robin.sendMessage(
        from,
        {
          image: {
            url: "https://github.com/dula9x/DARK-NOVA-XMD-V1-WEB-PAIR/raw/main/images/WhatsApp%20Image%202025-08-15%20at%2017.22.03_c520eb7b.jpg",
          },
          caption: menuText,
          footer: `Bot Version: ${config.VERSION || '1.0.0'}`,
          templateButtons: [
            {
              urlButton: {
                displayText: "🌟joing our group",
                url: "https://chat.whatsapp.com/INURXi0iHQbE1mZn9l7t6r"
              }
            },
            {
              quickReplyButton: {
                displayText: "Refresh Menu",
                id: `${config.PREFIX}menu`
              }
            }
          ]
        },
        { quoted: mek }
      );
    } catch (error) {
      console.error("Menu Error:", error);
      reply("❌ Failed to load menu. Please try again later.");
    }
  }
);
