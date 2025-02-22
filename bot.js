require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");
const { connectDB, closeDB } = require("./utils/db"); // Import fungsi connectDB dan closeDB dari db.js
const { initSewabot } = require("./features/sewabot"); // Import fungsi initSewabot
const { setupLevelCommands } = require("./features/levelSystem"); // Import fungsi setupLevelCommands
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

    // Load fitur bot
    require("./features/welcome_exit")(bot); // Fitur welcome dan exit
    require("./features/mute_unmute")(bot); // Fitur mute dan unmute
    require("./features/kick_user")(bot); // Fitur kick user
    require("./features/ban_unban")(bot); // Fitur ban dan unban
    require("./features/random_message")(bot); // Fitur pesan acak
    require("./features/sticker")(bot); // Fitur stiker
    require("./features/bussid")(bot); // Fitur BUSSID
    initSewabot(bot); // Inisialisasi fitur sewabot
    setupLevelCommands(bot); // Setup command terkait level dan diamond

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
  await closeDB(); // Tutup koneksi database
  process.exit(0);
});

process.once("SIGTERM", async () => {
  await bot.stop("SIGTERM");
  await closeDB(); // Tutup koneksi database
  process.exit(0);
});
