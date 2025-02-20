require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");
// Inisialisasi bot Telegram
const token = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || Math.floor(Math.random() * (50000 - 3000) + 3000);

const bot = new Telegraf(token);
const app = express();

// Express Server untuk menjaga bot tetap aktif
app.get("/", (req, res) => res.send("LuffyBot is running!"));
app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));

// Load banner bot terlebih dahulu
const sendBanner = require("./features/bannerbot")(bot);
// Load fitur bot
require("./features/welcome_exit")(bot);
require("./features/mute_unmute")(bot);
require("./features/kick_user")(bot);
require("./features/ban_unban")(bot);
require("./features/random_message")(bot);
require("./features/sticker")(bot);
// Menjalankan bot
bot.launch().then(() => console.log("LuffyBot is online!"));

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
