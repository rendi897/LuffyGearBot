const pool = require("../database");

module.exports = (bot) => {
    bot.on("message", async (ctx) => {
        const userId = ctx.from.id;
        const username = ctx.from.username || "unknown";

        try {
            await pool.query(`
                INSERT INTO users (user_id, username) 
                VALUES ($1, $2) 
                ON CONFLICT (user_id) DO NOTHING
            `, [userId, username]);

            const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);
            let { xp, level, cash } = user.rows[0];

            xp += Math.floor(Math.random() * 10) + 5;

            if (xp >= level * 100) {
                level++;
                xp = 0;
                cash += 50;
                await ctx.reply(`🎉 Selamat ${username}, naik ke level ${level}! Kamu dapat 50 cash.`);
            }

            await pool.query("UPDATE users SET xp = $1, level = $2, cash = $3 WHERE user_id = $4", [xp, level, cash, userId]);
        } catch (error) {
            console.error("Database error:", error);
        }
    });

    bot.command("cash", async (ctx) => {
        const userId = ctx.from.id;
        const user = await pool.query("SELECT cash FROM users WHERE user_id = $1", [userId]);
        ctx.reply(`💰 Cash kamu: ${user.rows[0]?.cash || 0}`);
    });
    
    bot.command("stat", async (ctx) => {
    const userId = ctx.from.id;

    try {
        const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);

        if (user.rows.length === 0) {
            return ctx.reply("❌ Kamu belum memiliki data! Kirim pesan di grup untuk mulai mengumpulkan XP.");
        }

        const { level, xp, cash } = user.rows[0];

        ctx.reply(`📊 *Statistik Kamu*\n\n🔹 Level: ${level}\n🔹 XP: ${xp}/${level * 100}\n💰 Cash: ${cash}`, 
        { parse_mode: "Markdown" });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        ctx.reply("⚠️ Terjadi kesalahan saat mengambil data.");
    }
});
    
    bot.command("addcash", async (ctx) => {
    const ownerId = process.env.OWNER_ID; // ID pemilik bot dari .env
    const senderId = ctx.from.id;
    const chatId = ctx.chat.id;

    try {
        // Cek apakah pengirim adalah OWNER atau admin grup
        const isOwner = senderId.toString() === ownerId;
        const admins = await ctx.getChatAdministrators();
        const isAdmin = admins.some((admin) => admin.user.id === senderId);

        if (!isOwner && !isAdmin) {
            return ctx.reply("❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
        }

        // Ambil parameter dari command: /addcash @username jumlah
        const args = ctx.message.text.split(" ");
        if (args.length < 3) {
            return ctx.reply("⚠️ Format salah! Gunakan: `/addcash @username jumlah`", { parse_mode: "Markdown" });
        }

        const username = args[1].replace("@", "");
        const amount = parseInt(args[2]);

        if (isNaN(amount) || amount <= 0) {
            return ctx.reply("⚠️ Masukkan jumlah cash yang valid.");
        }

        // Cari user di database
        const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (user.rows.length === 0) {
            return ctx.reply("❌ Pengguna tidak ditemukan dalam database.");
        }

        const userId = user.rows[0].user_id;
        const newCash = user.rows[0].cash + amount;

        // Update cash pengguna
        await pool.query("UPDATE users SET cash = $1 WHERE user_id = $2", [newCash, userId]);

        ctx.reply(`✅ Berhasil menambahkan ${amount} cash ke @${username}.`);
    } catch (error) {
        console.error("Error in /addcash:", error);
        ctx.reply("⚠️ Terjadi kesalahan saat menambahkan cash.");
    }
});

};
