const db = require("../firebase");

module.exports = (bot) => {
    bot.command("stat", async (ctx) => {
        const userId = ctx.from.id.toString();
        const userRef = db.collection("users").doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return ctx.reply("⚠️ Data kamu belum ada di sistem.");
        }

        const userData = userSnap.data();
        ctx.reply(`📊 *Statistik Kamu*\n\n🆔 ID: ${userId}\n🔹 Level: ${userData.level}\n💰 Gold: ${userData.gold}`);
    });
};
