const supabase = require("../db");

module.exports = (bot) => {
    bot.command("stat", async (ctx) => {
        const userId = ctx.from.id;

        const { data, error } = await supabase
            .from("users")
            .select("level, cash")
            .eq("user_id", userId)
            .single();

        if (error) {
            console.error("Database error:", error);
            return ctx.reply("❌ Terjadi kesalahan saat mengambil data.");
        }

        if (!data) {
            return ctx.reply("❌ Kamu belum punya data, coba lakukan sesuatu dulu!");
        }

        ctx.reply(`📊 *Statistik Kamu:*\n🆙 Level: ${data.level}\n💰 Cash: ${data.cash}`, { parse_mode: "Markdown" });
    });
};
