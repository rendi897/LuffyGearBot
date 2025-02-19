const supabase = require("../db");

module.exports = (bot) => {
    bot.command("addcash", async (ctx) => {
        const ownerId = process.env.OWNER_ID;
        const senderId = ctx.from.id;

        // Cek apakah pengirim adalah owner atau admin
        const isAdmin = ctx.chat.type === "private" || (await ctx.getChatAdministrators()).some(admin => admin.user.id === senderId);

        if (senderId != ownerId && !isAdmin) {
            return ctx.reply("❌ Kamu tidak memiliki izin untuk menambahkan cash.");
        }

        const args = ctx.message.text.split(" ");
        if (args.length < 3) {
            return ctx.reply("❌ Format salah! Gunakan: `/addcash @username jumlah`");
        }

        const mentionedUser = ctx.message.reply_to_message ? ctx.message.reply_to_message.from.id : args[1].replace("@", "");
        const amount = parseInt(args[2]);

        if (isNaN(amount) || amount <= 0) {
            return ctx.reply("❌ Masukkan jumlah cash yang valid.");
        }

        const { data, error } = await supabase
            .from("users")
            .select("cash")
            .eq("user_id", mentionedUser)
            .single();

        if (error) {
            console.error("Database error:", error);
            return ctx.reply("❌ Terjadi kesalahan saat mengambil data.");
        }

        if (!data) {
            return ctx.reply("❌ User belum terdaftar dalam sistem.");
        }

        const newCash = data.cash + amount;

        const { error: updateError } = await supabase
            .from("users")
            .update({ cash: newCash })
            .eq("user_id", mentionedUser);

        if (updateError) {
            console.error("Database error:", updateError);
            return ctx.reply("❌ Terjadi kesalahan saat memperbarui cash.");
        }

        ctx.reply(`✅ Cash sebesar ${amount} telah ditambahkan untuk user ${mentionedUser}.`);
    });
};
