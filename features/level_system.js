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
};
