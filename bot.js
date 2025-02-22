require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");
const { connectDB, closeDB } = require("./utils/db");
const { initSewabot } = require("./features/sewabot"); // Impor initSewabot

// Inisialisasi bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 7777;

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

// Command /myid
bot.command("myid", (ctx) => {
  const userId = ctx.from.id;
  const firstName = ctx.from.first_name;
  const username = ctx.from.username || "Tidak ada username";

  ctx.reply(`
🆔 ID Anda: <code>${userId}</code>
👤 Nama Depan: <code>${firstName}</code>
🔖 Username: <code>${username}</code>
  `, { parse_mode: "HTML" });
});

// Hubungkan ke MongoDB dan muat fitur
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected, loading bot features...");

    // Inisialisasi fitur sewabot
    initSewabot(bot); // Panggil initSewabot di sini

    // Muat fitur secara dinamis
    const fs = require("fs");
    const path = require("path");
    const featuresDir = path.join(__dirname, "features");

    fs.readdirSync(featuresDir).forEach((file) => {
      if (file.endsWith(".js")) {
        const featurePath = path.join(featuresDir, file);
        const feature = require(featurePath);
        feature(bot); // Panggil fungsi dengan parameter bot
        console.log(`✅ Loaded feature: ${file}`);
      }
    });

    // Jalankan bot
    bot.launch().then(() => console.log("🤖 Bot is online!"));
  })
  .catch((error) => {
    console.error("❌ Gagal memuat bot:", error);
    process.exit(1);
  });

// Express server untuk health check
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(PORT, () => console.log(`🌐 Express server running on port ${PORT}`));

// Graceful shutdown
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  closeDB();
  process.exit(0);
});

process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  closeDB();
  process.exit(0);
});
