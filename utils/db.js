const { MongoClient } = require("mongodb");
const config = require("../config");

// Ganti dengan connection string MongoDB Atlas Anda
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://REXBASE:Rendi2003@cluster0.qa066.mongodb.net/botdb?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(MONGO_URI, {
  tls: true, // Aktifkan TLS
  tlsAllowInvalidCertificates: false, // Jangan izinkan sertifikat yang tidak valid
});

let db;

// Fungsi untuk menghubungkan ke MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db("botdb"); // Ganti dengan nama database Anda
    console.log("✅ Terhubung ke MongoDB");
  } catch (error) {
    console.error("❌ Gagal terhubung ke MongoDB:", error);
    process.exit(1); // Keluar dari proses jika gagal terhubung
  }
}

// Fungsi untuk mendapatkan database
function getDB() {
  if (!db) {
    throw new Error("Database belum terhubung. Pastikan connectDB() dipanggil terlebih dahulu.");
  }
  return db;
}

// Fungsi untuk mendapatkan koleksi rentals
function getRentalsCollection() {
  return getDB().collection("rentals");
}

// Fungsi untuk mendapatkan koleksi users
function getUsersCollection() {
  return getDB().collection("users");
}

// Fungsi untuk menutup koneksi MongoDB
async function closeDB() {
  try {
    await client.close();
    console.log("✅ Koneksi MongoDB ditutup");
  } catch (error) {
    console.error("❌ Gagal menutup koneksi MongoDB:", error);
  }
}

module.exports = {
  connectDB,
  getDB,
  getRentalsCollection,
  getUsersCollection,
  closeDB,
};
