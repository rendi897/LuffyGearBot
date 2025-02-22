require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");
const { connectDB, closeDB } = require("./utils/db");
const { initSewabot } = require("./features/sewabot");
const { setupLevelCommands } = require("./features/levelSystem");
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
