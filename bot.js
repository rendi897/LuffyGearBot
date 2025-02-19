require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");
const { Client } = require("pg");

// PostgreSQL Setup
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch(err => console.error("Connection error", err.stack));

// Inisialisasi bot Telegram
const token = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || Math.floor(Math.random() * (50000 - 3000) + 3000);

const bot = new Telegraf(token);
const app = express();

// Express Server untuk menjaga bot tetap aktif
app.get("/", (req, res) => res.send("LuffyBot is running!"));
app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));

// Load fitur bot
require("./features/welcome_exit")(bot);
require("./features/mute_unmute")(bot);
require("./features/kick_user")(bot);
require("./features/ban_unban")(bot);
require("./features/random_message")(bot);
require("./features/leveling")(bot);  // Add leveling feature
require("./features/addcash")(bot);  // Add addcash feature

// Menjalankan bot
bot.launch().then(() => console.log("LuffyBot is online!"));

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

