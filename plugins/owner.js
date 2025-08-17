const { cmd } = require('../command');

// Block command
cmd({
    pattern: "block",
    react: "⚠️",
    alias: ["ban"],
    desc: "Block a user instantly.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { quoted, reply, isOwner, sender }) => {
    try {
        if (!isOwner) return reply("⚠️ Only the owner can use this command!");
        if (!quoted) return reply("⚠️ Please reply to the user's message to block them!");

        const target = quoted.sender || m.mentionedJid?.[0];
        if (!target) return reply("⚠️ Could not identify user to block!");

        await robin.updateBlockStatus(target, "block");
        return reply(`✅ Successfully blocked: @${target.split('@')[0]}`, { mentions: [target] });
    } catch (e) {
        console.error("Block Error:", e);
        return reply(`❌ Failed to block user. ${e.message.includes('not found') ? 'User not found.' : ''}`);
    }
});

// Kick command
cmd({
    pattern: "kick",
    alias: ["remove"],
    react: "⚠️",
    desc: "Remove a mentioned user from the group.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, quoted, sender }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        const target = quoted?.sender || m.mentionedJid?.[0];
        if (!target) return reply("⚠️ Please mention or reply to the user you want to kick!");

        const groupMetadata = await robin.groupMetadata(from);
        const isTargetAdmin = groupMetadata.participants.find(p => p.id === target)?.admin;

        if (isTargetAdmin) return reply("⚠️ I cannot remove another admin from the group!");
        if (target === robin.user.id) return reply("⚠️ I can't kick myself!");

        await robin.groupParticipantsUpdate(from, [target], "remove");
        return reply(`✅ Successfully removed: @${target.split('@')[0]}`, { mentions: [target] });
    } catch (e) {
        console.error("Kick Error:", e);
        return reply(`❌ Failed to remove user. ${e.message.includes('not in group') ? 'User not in group.' : ''}`);
    }
});

// Leave command
cmd({
    pattern: "left",
    alias: ["leave", "exit"],
    react: "⚠️",
    desc: "Leave the current group.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isOwner, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isOwner) return reply("⚠️ Only the owner can use this command!");

        await robin.groupLeave(from);
        return; // No reply needed as we're leaving
    } catch (e) {
        console.error("Leave Error:", e);
        return reply(`❌ Failed to leave group. ${e.message.includes('not in group') ? 'Already left.' : ''}`);
    }
});

// Mute command
cmd({
    pattern: "mute",
    alias: ["silence", "lock"],
    react: "⚠️",
    desc: "Set group chat to admin-only messages.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ This command is only for group admins!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        await robin.groupSettingUpdate(from, "announcement");
        return reply("✅ Group has been muted. Only admins can send messages now!");
    } catch (e) {
        console.error("Mute Error:", e);
        return reply(`❌ Failed to mute group. ${e.message.includes('not admin') ? 'Check my admin status.' : ''}`);
    }
});

// Unmute command
cmd({
    pattern: "unmute",
    alias: ["unlock"],
    react: "⚠️",
    desc: "Allow everyone to send messages in the group.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ This command is only for group admins!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        await robin.groupSettingUpdate(from, "not_announcement");
        return reply("✅ Group has been unmuted. Everyone can send messages now!");
    } catch (e) {
        console.error("Unmute Error:", e);
        return reply(`❌ Failed to unmute group. ${e.message.includes('not admin') ? 'Check my admin status.' : ''}`);
    }
});

// Add command
cmd({
    pattern: "add",
    alias: ["invite"],
    react: "➕",
    desc: "Add a user to the group.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, args }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        const targets = args.map(arg => arg.includes('@') ? arg : `${arg}@s.whatsapp.net`);
        if (!targets.length) return reply("⚠️ Please provide phone numbers of users to add!");

        await robin.groupParticipantsUpdate(from, targets, "add");
        return reply(`✅ Successfully added ${targets.length} user(s)`);
    } catch (e) {
        console.error("Add Error:", e);
        return reply(`❌ Failed to add users. ${e.message.includes('not authorized') ? 'Not authorized to add.' : ''}`);
    }
});

// Demote command
cmd({
    pattern: "demote",
    alias: ["member"],
    react: "⚠️",
    desc: "Remove admin privileges from a mentioned user.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, quoted, sender }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        const target = quoted?.sender || m.mentionedJid?.[0];
        if (!target) return reply("⚠️ Please mention or reply to the user you want to demote!");

        const groupMetadata = await robin.groupMetadata(from);
        const isTargetAdmin = groupMetadata.participants.find(p => p.id === target)?.admin;

        if (!isTargetAdmin) return reply("⚠️ The user is not an admin!");
        if (target === sender) return reply("⚠️ You can't demote yourself!");

        await robin.groupParticipantsUpdate(from, [target], "demote");
        return reply(`✅ Successfully demoted: @${target.split('@')[0]}`, { mentions: [target] });
    } catch (e) {
        console.error("Demote Error:", e);
        return reply(`❌ Failed to demote user. ${e.message.includes('not admin') ? 'Check my admin status.' : ''}`);
    }
});

// Promote command
cmd({
    pattern: "promote",
    alias: ["admin", "makeadmin"],
    react: "⚡",
    desc: "Grant admin privileges to a mentioned user.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, quoted, sender }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        const target = quoted?.sender || m.mentionedJid?.[0];
        if (!target) return reply("⚠️ Please mention or reply to the user you want to promote!");

        const groupMetadata = await robin.groupMetadata(from);
        const isTargetAdmin = groupMetadata.participants.find(p => p.id === target)?.admin;

        if (isTargetAdmin) return reply("⚠️ The user is already an admin!");

        await robin.groupParticipantsUpdate(from, [target], "promote");
        return reply(`✅ Successfully promoted: @${target.split('@')[0]}`, { mentions: [target] });
    } catch (e) {
        console.error("Promote Error:", e);
        return reply(`❌ Failed to promote user. ${e.message.includes('not admin') ? 'Check my admin status.' : ''}`);
    }
});
