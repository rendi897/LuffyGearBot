module.exports = (bot, db) => {
    const levels = [
        { name: "Kernet Pemula", exp: 10000 },
        { name: "Sopir Harian", exp: 20000 },
        { name: "Pengusaha Angkot", exp: 30000 },
        { name: "Bos PO Bus", exp: 40000 },
        { name: "Sultan Garasi", exp: 50000 },
        { name: "Juragan BUSSID", exp: 60000 }
    ];

    bot.on("message", async (ctx) => {
        if (!ctx.message || !ctx.message.chat || ctx.message.chat.type !== "supergroup") return;
        
        const userId = ctx.message.from.id;
        const firstName = ctx.message.from.first_name;
        
        // Ambil data pengguna
        const res = await db.query("SELECT exp, level FROM users WHERE user_id = $1", [userId]);
        let user = res.rows[0];
        
        if (!user) {
            await db.query("INSERT INTO users (user_id, exp, level, cash) VALUES ($1, 0, 0, 0)", [userId]);
            user = { exp: 0, level: 0 };
        }

        // Tambah EXP secara acak
        const gainedExp = Math.floor(Math.random() * 20) + 5;
        const newExp = user.exp + gainedExp;
        let newLevel = user.level;
        
        if (newLevel < levels.length && newExp >= levels[newLevel].exp) {
            newLevel++;
            ctx.reply(`🎉 Selamat, ${firstName}! Kamu naik ke level ${newLevel + 1}: *${levels[newLevel].name}*`);
        }
        
        // Simpan ke database
        await db.query("UPDATE users SET exp = $1, level = $2 WHERE user_id = $3", [newExp, newLevel, userId]);
    });

    bot.command("stat", async (ctx) => {
        const userId = ctx.message.from.id;
        const firstName = ctx.message.from.first_name;
        
        const res = await db.query("SELECT exp, level, cash FROM users WHERE user_id = $1", [userId]);
        const user = res.rows[0];
        
        if (!user) return ctx.reply("⚠️ Kamu belum memiliki data EXP!");
        
        ctx.reply(`📊 *${firstName}*
🆔 ID: ${userId}
🆙 Level: ${user.level + 1} (${levels[user.level]?.name || "Tidak diketahui"})
💠 EXP: ${user.exp}/${levels[user.level]?.exp || "MAX"}
💰 Cash: ${user.cash}`);
    });
};
