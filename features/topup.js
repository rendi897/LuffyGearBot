const db = require("../firebase");

module.exports = (bot) => {
    const OWNER_ID = process.env.OWNER_ID; // ID Anda sebagai admin

    bot.command("topup", async (ctx) => {
        if (ctx.from.id.toString() !== OWNER_ID) {
            return ctx.reply("❌ Hanya admin yang bisa melakukan topup!");
        }

        const args = ctx.message.text.split(" ");
        if (args.length < 3) return ctx.reply("Format: `/topup <user_id> <jumlah>`");

        const userId = args[1];
        const amount = parseInt(args[2]);

        if (isNaN(amount)) return ctx.reply("Jumlah harus berupa angka!");

        const userRef = db.collection("users").doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) return ctx.reply("User tidak ditemukan!");

        const userData = userSnap.data();
        const newGold = (userData.gold || 0) + amount;

        await userRef.update({ gold: newGold });

        ctx.reply(`✅ Berhasil topup ${amount} gold untuk ID ${userId}!`);
    });
};
