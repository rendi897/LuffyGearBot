const { MongoClient } = require("mongodb");
const config = require("../config");

const MONGO_URI = "mongodb+srv://REXBASE:Rendi2003@cluster.mongodb.net/botdb";
const client = new MongoClient(MONGO_URI);
const db = client.db("botdb");
const rentalsCollection = db.collection("rentals");

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Terhubung ke MongoDB");
  } catch (error) {
    console.error("❌ Gagal terhubung ke MongoDB:", error);
  }
}

connectDB();

async function checkUserAccess(userId) {
  const rental = await rentalsCollection.findOne({ userId, expiresAt: { $gt: Date.now() } });
  return rental ? true : false;
}

async function addRental(ownerId, userId, durationDays) {
  if (!config.owners.includes(ownerId)) {
    return "❌ Anda tidak memiliki izin untuk menambah sewa.";
  }

  const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;
  await rentalsCollection.updateOne(
    { userId },
    { $set: { userId, expiresAt } },
    { upsert: true }
  );

  return `✅ Sukses! Akses diberikan selama ${durationDays} hari.`;
}

async function removeRental(ownerId, userId) {
  if (!config.owners.includes(ownerId)) {
    return "❌ Anda tidak memiliki izin untuk menghapus sewa.";
  }

  await rentalsCollection.deleteOne({ userId });
  return `✅ Akses user ${userId} telah dihapus.`;
}

module.exports = {
  checkUserAccess,
  addRental,
  removeRental
};
