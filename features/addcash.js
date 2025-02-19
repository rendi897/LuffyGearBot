module.exports = (bot, db) => {
    bot.command("addcash", async (ctx) => {
        const ownerId = process.env.OWNER_ID;
        if (ctx.message.from.id != ownerId) return ctx.reply("❌ Hanya owner yang bisa menambah cash!");
        
        const args = ctx.message.text.split(" ").slice(1);
        if (args.length < 2) return ctx.reply("❌ Format salah! Gunakan: /addcash [user_id] [jumlah]");
        
        const userId = parseInt(args[0]);
        const amount = parseInt(args[1]);
        if (isNaN(userId) || isNaN(amount)) return ctx.reply("⚠️ Masukkan angka yang valid!");
        
        // Cek apakah pengguna sudah ada dalam database
        const res = await db.query("SELECT cash FROM users WHERE user_id = $1", [userId]);
        if (res.rows.length === 0) {
            await db.query("INSERT INTO users (user_id, exp, level, cash) VALUES ($1, 0, 0, $2)", [userId, amount]);
        } else {
            await db.query("UPDATE users SET cash = cash + $1 WHERE user_id = $2", [amount, userId]);
        }
        
        ctx.reply(`✅ Berhasil menambahkan ${amount} cash untuk user ${userId}`);
    });
};
