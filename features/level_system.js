const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = (bot) => {
    bot.on("message", async (ctx) => {
        const userId = ctx.from.id;
        const username = ctx.from.username || "unknown";

        try {
            // Insert user if not exists
            await supabase.from("users").upsert({
                id: userId,
                username: username,
                xp: 0,
                level: 1,
                cash: 0
            }, { onConflict: ["id"] });

            // Fetch user data
            const { data: user, error } = await supabase
                .from("users")
                .select("xp, level, cash")
                .eq("id", userId)
                .single();

            if (error) throw error;

            let { xp, level, cash } = user;
            xp += Math.floor(Math.random() * 10) + 5;

            if (xp >= level * 100) {
                level++;
                xp = 0;
                cash += 50;
                await ctx.reply(`🎉 Selamat ${username}, naik ke level ${level}! Kamu dapat 50 cash.`);
            }

            // Update user data
            await supabase.from("users").update({ xp, level, cash }).eq("id", userId);
        } catch (error) {
            console.error("Database error:", error);
        }
    });

    bot.command("userinfo", async (ctx) => {
        const userId = ctx.from.id;
        
        try {
            const { data: user, error } = await supabase
                .from("users")
                .select("username, xp, level, cash")
                .eq("id", userId)
                .single();

            if (error || !user) {
                return ctx.reply("❌ Data pengguna tidak ditemukan.");
            }

            ctx.reply(`📊 *Informasi Pengguna* \n👤 Username: ${user.username}\n🆔 User ID: ${userId}\n⭐ XP: ${user.xp}\n🎚 Level: ${user.level}\n💰 Cash: ${user.cash}`);
        } catch (error) {
            console.error("Database error:", error);
            ctx.reply("❌ Terjadi kesalahan saat mengambil data pengguna.");
        }
    });
};
