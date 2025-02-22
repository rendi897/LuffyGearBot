require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");
const { connectDB, closeDB } = require("./utils/db");
const { registerUser, addExp, addDiamond, getUserStats } = require("./features/levelSystem");
const config = require("./config");

// Inisialisasi bot Telegram
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("BOT TOKEN tidak ditemukan. Pastikan TELEGRAM_BOT_TOKEN sudah diset di .env");
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const bot = new Telegraf(token);
const app = express();

// Express Server untuk menjaga bot tetap aktif
app.get("/", (req, res) => res.send("LuffyBot is running!"));
app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));

// Middleware untuk logging
bot.use((ctx, next) => {
  console.log(`Received message: ${ctx.message.text}`);
  return next();
});

// Middleware untuk error handling
bot.catch((err, ctx) => {
  console.error(`Error for update ${ctx.update.update_id}:`, err);
  ctx.reply("❌ Terjadi kesalahan saat memproses permintaan Anda.");
});

// Hubungkan ke MongoDB sebelum menjalankan bot
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected, loading bot features...");

    // Load fitur bot secara dinamis
    const fs = require("fs");
    const path = require("path");
    const featuresDir = path.join(__dirname, "features");
    fs.readdirSync(featuresDir).forEach((file) => {
      if (file.endsWith(".js")) {
        require(path.join(featuresDir, file))(bot);
        console.log(`Loaded feature: ${file}`);
      }
    });

    // Event listener untuk setiap pesan yang dikirim (Level System)
    bot.on("message", async (ctx) => {
      const userId = ctx.from.id;
      const username = ctx.from.username || ctx.from.first_name;

      try {
        // Mendaftarkan pengguna secara otomatis
        await registerUser(userId, username);

        // Menambahkan exp setiap kali pengguna mengirim pesan
        await addExp(userId, 5); // Tambahkan 5 exp setiap pesan
      } catch (error) {
        console.error("Error handling message:", error);
        ctx.reply("❌ Terjadi kesalahan saat memproses pesan Anda.");
      }
    });

    // Command /stat untuk mengecek statistik pengguna (Level System)
    bot.command("stat", async (ctx) => {
      const userId = ctx.from.id;

      try {
        const stats = await getUserStats(userId);
        ctx.reply(`Level: ${stats.level}\nExp: ${stats.exp}\n💎 Diamond: ${stats.diamond}`);
      } catch (error) {
        console.error("Error in /stat command:", error);
        ctx.reply("❌ Gagal mengambil statistik pengguna.");
      }
    });

    // Command /topup untuk menambah diamond (hanya admin)
    bot.command("topup", async (ctx) => {
      const userId = ctx.from.id;
      const args = ctx.message.text.split(" ");

      // Cek apakah pengguna adalah admin
      const isAdmin = true; // Ganti dengan logika pengecekan admin Anda
      if (!isAdmin) {
        return ctx.reply("❌ Hanya admin yang bisa menggunakan command ini.");
      }

      // Validasi input
      if (args.length < 3) {
        return ctx.reply("❌ Format: /topup <user_id> <jumlah_diamond>");
      }

      const targetUserId = parseInt(args[1]);
      const diamondToAdd = parseInt(args[2]);

      if (isNaN(targetUserId) || isNaN(diamondToAdd)) {
        return ctx.reply("❌ User ID atau jumlah diamond tidak valid.");
      }

      try {
        const newDiamond = await addDiamond(targetUserId, diamondToAdd);
        ctx.reply(`✅ Berhasil menambahkan ${diamondToAdd}💎 ke user ${targetUserId}. Total diamond sekarang: ${newDiamond}💎`);
      } catch (error) {
        console.error("Error in /topup command:", error);
        ctx.reply(`❌ Gagal menambahkan diamond: ${error.message}`);
      }
    });

    // Menjalankan bot
    bot.launch().then(() => console.log("LuffyBot is online!"));
  })
  .catch((error) => {
    console.error("❌ Gagal memuat bot:", error);
    process.exit(1);
  });

// Graceful shutdown
process.once("SIGINT", async () => {
  await bot.stop("SIGINT");
  await closeDB();
  process.exit(0);
});

process.once("SIGTERM", async () => {
  await bot.stop("SIGTERM");
  await closeDB();
  process.exit(0);
});
