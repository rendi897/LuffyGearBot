const pool = require("../database");

module.exports = (bot) => {
    bot.command("addcash", async (ctx) => {
        const ownerId = process.env.OWNER_ID;
        const senderId = ctx.from.id;

        const isOwner = senderId.toString() === ownerId;
        const admins = await ctx.getChatAdministrators();
        const isAdmin = admins.some((admin) => admin.user.id === senderId);

        if (!isOwner && !isAdmin) {
            return ctx.reply("❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
        }

        const args = ctx.message.text.split(" ");
        if (args.length < 3) {
            return ctx.reply("⚠️ Format salah! Gunakan: `/addcash user_id jumlah`", { parse_mode: "Markdown" });
        }

        const userId = parseInt(args[1]);
        const amount = parseInt(args[2]);

        if (isNaN(userId) || isNaN(amount) || amount <= 0) {
            return ctx.reply("⚠️ Masukkan user ID dan jumlah cash yang valid.");
        }

        try {
            const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);
            if (user.rows.length === 0) {
                return ctx.reply("❌ Pengguna tidak ditemukan dalam database.");
            }

            const newCash = user.rows[0].cash + amount;
            await pool.query("UPDATE users SET cash = $1 WHERE user_id = $2", [newCash, userId]);

            ctx.reply(`✅ Berhasil menambahkan ${amount} cash ke pengguna dengan ID ${userId}.`);
        } catch (error) {
            console.error("Error in /addcash:", error);
            ctx.reply("⚠️ Terjadi kesalahan saat menambahkan cash.");
        }
    });
};
