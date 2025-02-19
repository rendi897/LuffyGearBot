const pool = require("../database");

module.exports = (bot) => {
    bot.command("stat", async (ctx) => {
        const userId = ctx.from.id;
        console.log("/stat command received from:", userId);

        try {
            const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);
            console.log("Database result:", user.rows);

            if (user.rows.length === 0) {
                return ctx.reply("❌ Kamu belum memiliki data! Kirim pesan di grup untuk mulai mengumpulkan XP.");
            }

            const { level, xp, cash } = user.rows[0];
            ctx.reply(`📊 *Statistik Kamu*\n\n🔹 Level: ${level}\n🔹 XP: ${xp}/${level * 100}\n💰 Cash: ${cash}`, { parse_mode: "Markdown" });
        } catch (error) {
            console.error("Error in /stat:", error);
            ctx.reply("⚠️ Terjadi kesalahan saat mengambil data.");
        }
    });
};
