const { Telegraf } = require("telegraf");
const config = require("../config");
const fs = require("fs");
const path = require("path");

const SEWA_FILE = path.join(__dirname, "sewa_data.json");
let sewaData = {};

// Load data sewa dari file
if (fs.existsSync(SEWA_FILE)) {
    sewaData = JSON.parse(fs.readFileSync(SEWA_FILE));
}

module.exports = function sewaAkses(bot) {
    bot.command("sewa", async (ctx) => {
        if (!config.owners.includes(ctx.from.id)) {
            return ctx.reply("❌ Hanya pemilik bot yang bisa mengelola sewa akses!");
        }

        const args = ctx.message.text.split(" ").slice(1);
        if (args.length < 2) {
            return ctx.reply("❌ Gunakan format: /sewa <user_id> <hari>");
        }

        const userId = parseInt(args[0]);
        const days = parseInt(args[1]);
        if (isNaN(userId) || isNaN(days)) {
            return ctx.reply("❌ ID atau jumlah hari tidak valid!");
        }

        const expireDate = Date.now() + days * 24 * 60 * 60 * 1000;
        sewaData[userId] = { expires: expireDate };
        fs.writeFileSync(SEWA_FILE, JSON.stringify(sewaData, null, 2));

        ctx.reply(`✅ Akses diberikan ke ${userId} selama ${days} hari.`);
    });

    bot.command("ceksewa", async (ctx) => {
        const userId = ctx.message.from.id;
        if (!sewaData[userId] || sewaData[userId].expires < Date.now()) {
            return ctx.reply("❌ Anda tidak memiliki akses aktif!");
        }
        const remainingDays = Math.ceil((sewaData[userId].expires - Date.now()) / (24 * 60 * 60 * 1000));
        ctx.reply(`✅ Akses aktif! Sisa waktu: ${remainingDays} hari.`);
    });

    bot.command("hapussewa", async (ctx) => {
        if (!config.owners.includes(ctx.from.id)) {
            return ctx.reply("❌ Hanya pemilik bot yang bisa menghapus akses sewa!");
        }

        const args = ctx.message.text.split(" ").slice(1);
        if (args.length < 1) {
            return ctx.reply("❌ Gunakan format: /hapussewa <user_id>");
        }

        const userId = parseInt(args[0]);
        if (isNaN(userId) || !sewaData[userId]) {
            return ctx.reply("❌ User tidak ditemukan dalam daftar sewa!");
        }

        delete sewaData[userId];
        fs.writeFileSync(SEWA_FILE, JSON.stringify(sewaData, null, 2));

        ctx.reply(`✅ Akses untuk ${userId} telah dihapus.`);
    });
};

module.exports.isSewaActive = function (userId) {
    return sewaData[userId] && sewaData[userId].expires > Date.now();
};
