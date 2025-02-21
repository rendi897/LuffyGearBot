const { MongoClient } = require("mongodb");
const config = require("../config");

// Ganti dengan connection string MongoDB Atlas Anda
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://REXBASE:Rendi2003@cluster0.qa066.mongodb.net/botdb?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(MONGO_URI, {
  tls: true, // Aktifkan TLS
  tlsAllowInvalidCertificates: false, // Jangan izinkan sertifikat yang tidak valid
});

const db = client.db("botdb");
const rentalsCollection = db.collection("rentals");

// Fungsi untuk menghubungkan ke MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Terhubung ke MongoDB");
  } catch (error) {
    console.error("❌ Gagal terhubung ke MongoDB:", error);
  }
}

// Fungsi untuk memeriksa akses user
async function checkUserAccess(userId) {
  try {
    const rental = await rentalsCollection.findOne({ userId, expiresAt: { $gt: Date.now() } });
    return rental ? true : false;
  } catch (error) {
    console.error("❌ Gagal memeriksa akses user:", error);
    return false;
  }
}

// Fungsi untuk menambah sewa akses
async function addRental(ownerId, userId, durationDays) {
  if (!config.owners.includes(ownerId)) {
    return "❌ Anda tidak memiliki izin untuk menambah sewa.";
  }

  try {
    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;
    await rentalsCollection.updateOne(
      { userId },
      { $set: { userId, expiresAt } },
      { upsert: true }
    );
    return `✅ Sukses! Akses diberikan selama ${durationDays} hari.`;
  } catch (error) {
    console.error("❌ Gagal menambah sewa:", error);
    return "❌ Gagal menambah sewa. Silakan coba lagi.";
  }
}

// Fungsi untuk menghapus sewa akses
async function removeRental(ownerId, userId) {
  if (!config.owners.includes(ownerId)) {
    return "❌ Anda tidak memiliki izin untuk menghapus sewa.";
  }

  try {
    await rentalsCollection.deleteOne({ userId });
    return `✅ Akses user ${userId} telah dihapus.`;
  } catch (error) {
    console.error("❌ Gagal menghapus sewa:", error);
    return "❌ Gagal menghapus sewa. Silakan coba lagi.";
  }
}

// Fungsi untuk menginisialisasi fitur sewabot
function initSewabot(bot) {
  bot.command("sewa", async (ctx) => {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(" ");

    if (args.length < 3) {
      return ctx.reply("❌ Format perintah salah. Gunakan: /sewa <user_id> <durasi_hari>");
    }

    const targetUserId = parseInt(args[1]);
    const durationDays = parseInt(args[2]);

    if (isNaN(targetUserId) || isNaN(durationDays)) {
      return ctx.reply("❌ User ID atau durasi hari tidak valid.");
    }

    const result = await addRental(userId, targetUserId, durationDays);
    ctx.reply(result);
  });

  bot.command("hapussewa", async (ctx) => {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(" ");

    if (args.length < 2) {
      return ctx.reply("❌ Format perintah salah. Gunakan: /hapussewa <user_id>");
    }

    const targetUserId = parseInt(args[1]);

    if (isNaN(targetUserId)) {
      return ctx.reply("❌ User ID tidak valid.");
    }

    const result = await removeRental(userId, targetUserId);
    ctx.reply(result);
  });
}

module.exports = {
  connectDB,
  checkUserAccess,
  addRental,
  removeRental,
  initSewabot // Ekspor fungsi initSewabot
};
