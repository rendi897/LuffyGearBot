module.exports = (bot) => {
    const OWNER_ID = process.env.OWNER_ID; // ID pemilik bot dari .env

    bot.command("ban", async (ctx) => {
        if (!(await isAdmin(ctx))) return;

        if (!ctx.message.reply_to_message) {
            return ctx.reply("❌ Balas pesan user yang ingin di-ban!");
        }

        const userId = ctx.message.reply_to_message.from.id;

        if (userId == OWNER_ID) {
            return ctx.reply("❌ Kamu tidak bisa ban pemilik bot!");
        }

        const isTargetAdmin = await isAdminById(ctx, userId);
        if (isTargetAdmin && ctx.message.from.id != OWNER_ID) {
            return ctx.reply("❌ Kamu tidak bisa ban admin lain, hanya pemilik bot yang bisa melakukannya!");
        }

        try {
            await ctx.kickChatMember(userId);
            ctx.reply(`🚫 User ${ctx.message.reply_to_message.from.first_name} telah di-ban!`);
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

        try {
            await ctx.unbanChatMember(userId);
            ctx.reply(`✅ User ${ctx.message.reply_to_message.from.first_name} telah di-unban!`);
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
