const mongoose = require("mongoose");
const { Telegraf } = require("telegraf");
const config = require("../config");

// Koneksi MongoDB
mongoose.connect(config.mongodb_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const SewaSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  expireAt: { type: Date, required: true },
});

const Sewa = mongoose.model("Sewa", SewaSchema);

module.exports = function sewaSystem(bot) {
  bot.command("sewa", async (ctx) => {
    if (!config.owners.includes(ctx.from.id)) {
      return ctx.reply("❌ Hanya pemilik bot yang bisa menyewakan akses.");
    }
    
    const args = ctx.message.text.split(" ").slice(1);
    if (args.length < 2) {
      return ctx.reply("❌ Gunakan format: /sewa <user_id> <durasi_hari>");
    }

    const userId = parseInt(args[0]);
    const durasiHari = parseInt(args[1]);
    if (isNaN(userId) || isNaN(durasiHari)) {
      return ctx.reply("❌ ID pengguna dan durasi harus berupa angka.");
    }

    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + durasiHari);

    try {
      await Sewa.findOneAndUpdate(
        { userId },
        { expireAt },
        { upsert: true, new: true }
      );
      ctx.reply(`✅ Akses diberikan ke ${userId} selama ${durasiHari} hari.`);
    } catch (error) {
      console.error(error);
      ctx.reply("❌ Terjadi kesalahan saat menyewa akses.");
    }
  });

  bot.command("ceksewa", async (ctx) => {
    const userId = ctx.from.id;
    const data = await Sewa.findOne({ userId });
    
    if (!data || new Date() > data.expireAt) {
      return ctx.reply("❌ Anda tidak memiliki akses.");
    }

    ctx.reply(`✅ Akses aktif hingga: ${data.expireAt.toLocaleString()}`);
  });
};
