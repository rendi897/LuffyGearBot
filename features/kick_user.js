const config = require("../config"); // Import config.js

module.exports = function (bot) => {
    bot.command("kick", async (ctx) => {
        if (!(await isAdmin(ctx))) return;

        if (!ctx.message.reply_to_message) {
            return ctx.reply("❌ Balas pesan user yang ingin di-kick!");
        }

        const userId = ctx.message.reply_to_message.from.id;
        const userName = ctx.message.reply_to_message.from.first_name;

        if (config.owners.includes(userId)) {
            return ctx.reply("❌ Kamu tidak bisa kick pemilik bot!");
        }

        if (userId === ctx.botInfo.id) {
            return ctx.reply("❌ Aku tidak bisa mengeluarkan diriku sendiri!");
        }

        const isTargetAdmin = await isAdminById(ctx, userId);
        if (isTargetAdmin && !config.owners.includes(ctx.message.from.id)) {
            return ctx.reply("❌ Kamu tidak bisa kick admin lain, hanya pemilik bot yang bisa melakukannya!");
        }

        try {
            await ctx.kickChatMember(userId);
            await ctx.unbanChatMember(userId); // Agar user bisa bergabung lagi jika diundang
            
            ctx.reply(`👢 User *${userName}* telah di-kick dari grup!`, { parse_mode: "Markdown" });
        } catch (error) {
            console.error(error);
            ctx.reply("❌ Gagal mengeluarkan user.");
        }
    });

    async function isAdmin(ctx) {
        const chatAdmins = await ctx.getChatAdministrators();
        const userId = ctx.message.from.id;
        const isAdmin = chatAdmins.some(admin => admin.user.id === userId);

        if (!isAdmin) {
            ctx.reply("❌ Hanya admin yang bisa menggunakan perintah ini!");
        }
        return isAdmin;
    }

    async function isAdminById(ctx, userId) {
        const chatAdmins = await ctx.getChatAdministrators();
        return chatAdmins.some(admin => admin.user.id === userId);
    }
};
