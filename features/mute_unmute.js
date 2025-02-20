module.exports = (bot) => {
    const OWNER_ID = process.env.OWNER_ID; // ID pemilik bot dari .env

    bot.command("mute", async (ctx) => {
        if (!(await isAdmin(ctx))) return;

        const args = ctx.message.text.split(" ").slice(1);
        if (!ctx.message.reply_to_message) {
            return ctx.reply("❌ Balas pesan user yang ingin di-mute dan tambahkan durasi! (Contoh: `/mute 30m`)");
        }

        const userId = ctx.message.reply_to_message.from.id;

        if (userId == OWNER_ID) {
            return ctx.reply("❌ Kamu tidak bisa mute pemilik bot!");
        }

        const isTargetAdmin = await isAdminById(ctx, userId);
        if (isTargetAdmin && ctx.message.from.id != OWNER_ID) {
            return ctx.reply("❌ Kamu tidak bisa mute admin lain, hanya pemilik bot yang bisa melakukannya!");
        }

        if (args.length === 0) {
            return ctx.reply("❌ Masukkan durasi mute! (Contoh: `/mute 1h` untuk 1 jam)");
        }

        const duration = parseDuration(args[0]);
        if (!duration) {
            return ctx.reply("❌ Format durasi tidak valid! Gunakan `10m` (menit), `2h` (jam), atau `1d` (hari).");
        }

        const untilDate = Math.floor(Date.now() / 1000) + duration;

        try {
            await ctx.restrictChatMember(userId, {
                permissions: {
                    can_send_messages: false,
                    can_send_media_messages: false,
                    can_send_polls: false,
                    can_send_other_messages: false,
                    can_add_web_page_previews: false,
                    can_invite_users: false,
                    can_pin_messages: false,
                },
                until_date: untilDate,
            });

            ctx.reply(`🔇 User ${ctx.message.reply_to_message.from.first_name} telah di-mute selama ${args[0]}!`);
        } catch (error) {
            console.error(error);
            ctx.reply("❌ Gagal melakukan mute user.");
        }
        
    });

    bot.command("unmute", async (ctx) => {
        if (!(await isAdmin(ctx))) return;

        if (!ctx.message.reply_to_message) {
            return ctx.reply("❌ Balas pesan user yang ingin di-unmute!");
        }

        const userId = ctx.message.reply_to_message.from.id;

        try {
            await ctx.restrictChatMember(userId, {
                permissions: {
                    can_send_messages: true,
                    can_send_media_messages: true,
                    can_send_polls: true,
                    can_send_other_messages: true,
                    can_add_web_page_previews: true,
                    can_invite_users: true,
                    can_pin_messages: false,
                }
            });

            ctx.reply(`🔊 User ${ctx.message.reply_to_message.from.first_name} telah di-unmute lebih awal!`);
        } catch (error) {
            console.error(error);
            ctx.reply("❌ Gagal melakukan unmute user.");
        }
        
    });

    bot.command("unadmin", async (ctx) => {
        if (ctx.message.from.id != OWNER_ID) {
            return ctx.reply("❌ Hanya pemilik bot yang bisa menurunkan admin!");
        }

        if (!ctx.message.reply_to_message) {
            return ctx.reply("❌ Balas pesan admin yang ingin diturunkan menjadi anggota biasa!");
        }

        const userId = ctx.message.reply_to_message.from.id;
        const isTargetAdmin = await isAdminById(ctx, userId);

        if (!isTargetAdmin) {
            return ctx.reply("❌ User ini bukan admin!");
        }

        try {
            await ctx.promoteChatMember(userId, {
                can_change_info: false,
                can_delete_messages: false,
                can_invite_users: false,
                can_restrict_members: false,
                can_pin_messages: false,
                can_promote_members: false,
            });

            ctx.reply(`⏬ User ${ctx.message.reply_to_message.from.first_name} telah diturunkan menjadi anggota biasa!`);
        } catch (error) {
            console.error(error);
            ctx.reply("❌ Gagal menurunkan admin.");
        }
        
    });

    function parseDuration(input) {
        const match = input.match(/^(\d+)([mhd])$/);
        if (!match) return null;

        const value = parseInt(match[1]);
        const unit = match[2];

        if (unit === "m") return value * 60;
        if (unit === "h") return value * 60 * 60;
        if (unit === "d") return value * 24 * 60 * 60;

        return null;
    }

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
