require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");
const { connectDB, initSewabot } = require("./features/sewabot"); // Import fungsi connectDB dan initSewabot
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

// Hubungkan ke MongoDB sebelum menjalankan bot
connectDB().then(() => {
  console.log("✅ MongoDB connected, loading bot features...");

  // Load fitur bot
  require("./features/welcome_exit")(bot);
  require("./features/mute_unmute")(bot);
  require("./features/kick_user")(bot);
  require("./features/ban_unban")(bot);
  require("./features/random_message")(bot);
  require("./features/sticker")(bot);
  require("./features/bussid")(bot);
  initSewabot(bot); // Inisialisasi fitur sewabot
  require("./features/levelSystem").setupLevelCommands(bot);

  // Menjalankan bot
  bot.launch().then(() => console.log("LuffyBot is online!"));
});

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
