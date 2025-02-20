const db = require("../firebase");

module.exports = (bot) => {
    bot.on("message", async (ctx) => {
        if (!ctx.message.text) return; // Cek jika bukan teks

        const userId = ctx.from.id.toString();
        const userRef = db.collection("users").doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            await userRef.set({ level: 1, xp: 0, gold: 0 });
        }

        const userData = userSnap.data();
        let { level, xp } = userData;

        xp += 10; // Tambah XP setiap chat
        if (xp >= 100) { 
            level += 1;
            xp = 0; 
            ctx.reply(`🎉 *${ctx.from.first_name} naik level!* Sekarang level ${level}!`);
        }

        await userRef.update({ level, xp });
    });
};
