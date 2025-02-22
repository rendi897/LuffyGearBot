const config = require("../config"); // Import konfigurasi

module.exports = function (bot) => {
    bot.command("ban", async (ctx) => {
        if (!(await isAdmin(ctx))) return;

        if (!ctx.message.reply_to_message) {
            return ctx.reply("❌ Balas pesan user yang ingin di-ban!");
        }

        const userId = ctx.message.reply_to_message.from.id;
        const userName = ctx.message.reply_to_message.from.first_name;

        if (config.owners.includes(userId)) {
            return ctx.reply("❌ Kamu tidak bisa ban pemilik bot!");
        }

        if (userId === ctx.botInfo.id) {
            return ctx.reply("❌ Aku tidak bisa ban diriku sendiri!");
        }

        const isTargetAdmin = await isAdminById(ctx, userId);
        if (isTargetAdmin && !config.owners.includes(ctx.message.from.id)) {
            return ctx.reply("❌ Kamu tidak bisa ban admin lain, hanya pemilik bot yang bisa melakukannya!");
        }

        try {
            await ctx.kickChatMember(userId);
            ctx.reply(`🚫 User *${userName}* telah di-ban dari grup!`, { parse_mode: "Markdown" });
        } catch (error) {
            console.error(error);
            ctx.reply("❌ Gagal melakukan ban user.");
        }
    });

    bot.command("unban", async (ctx) => {
        if (!(await isAdmin(ctx))) return;

        if (!ctx.message.reply_to_message) {
            return ctx.reply("❌ Balas pesan user yang ingin di-unban!");
        }

        const userId = ctx.message.reply_to_message.from.id;
        const userName = ctx.message.reply_to_message.from.first_name;

        try {
            await ctx.unbanChatMember(userId);
            ctx.reply(`✅ User *${userName}* telah di-unban!`, { parse_mode: "Markdown" });
        } catch (error) {
            console.error(error);
            ctx.reply("❌ Gagal melakukan unban user.");
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
