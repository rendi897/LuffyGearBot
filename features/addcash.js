const pool = require("../database");

module.exports = (bot) => {
    bot.command("addcash", async (ctx) => {
        const ownerId = process.env.OWNER_ID; // ID pemilik bot dari .env
        const senderId = ctx.from.id;

        const isOwner = senderId.toString() === ownerId;
        const admins = await ctx.getChatAdministrators();
        const isAdmin = admins.some((admin) => admin.user.id === senderId);

        if (!isOwner && !isAdmin) {
            return ctx.reply("❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
        }

        const args = ctx.message.text.split(" ");
        if (args.length < 3) {
            return ctx.reply("⚠️ Format salah! Gunakan: `/addcash @username jumlah`", { parse_mode: "Markdown" });
        }

        const username = args[1].replace("@", "");
        const amount = parseInt(args[2]);

        if (isNaN(amount) || amount <= 0) {
            return ctx.reply("⚠️ Masukkan jumlah cash yang valid.");
        }

        try {
            const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
            if (user.rows.length === 0) {
                return ctx.reply("❌ Pengguna tidak ditemukan dalam database.");
            }

            const userId = user.rows[0].user_id;
            const newCash = user.rows[0].cash + amount;

            await pool.query("UPDATE users SET cash = $1 WHERE user_id = $2", [newCash, userId]);

            ctx.reply(`✅ Berhasil menambahkan ${amount} cash ke @${username}.`);
        } catch (error) {
            console.error("Error in /addcash:", error);
            ctx.reply("⚠️ Terjadi kesalahan saat menambahkan cash.");
        }
    });
};
