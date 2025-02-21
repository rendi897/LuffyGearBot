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

    // Buat koleksi 'users' dan 'rentals' jika belum ada
    await createUsersCollection();
    await createRentalsCollection();
  } catch (error) {
    console.error("❌ Gagal terhubung ke MongoDB:", error);
    process.exit(1); // Keluar dari proses jika gagal terhubung
  }
}

// Fungsi untuk membuat koleksi 'users' jika belum ada
async function createUsersCollection() {
  try {
    const collections = await db.listCollections().toArray();
    const usersCollectionExists = collections.some((col) => col.name === "users");

    if (!usersCollectionExists) {
      await db.createCollection("users");
      console.log("✅ Koleksi 'users' berhasil dibuat.");
    } else {
      console.log("✅ Koleksi 'users' sudah ada.");
    }
  } catch (error) {
    console.error("❌ Gagal membuat koleksi 'users':", error);
  }
}

// Fungsi untuk membuat koleksi 'rentals' jika belum ada
async function createRentalsCollection() {
  try {
    const collections = await db.listCollections().toArray();
    const rentalsCollectionExists = collections.some((col) => col.name === "rentals");

    if (!rentalsCollectionExists) {
      await db.createCollection("rentals");
      console.log("✅ Koleksi 'rentals' berhasil dibuat.");
    } else {
      console.log("✅ Koleksi 'rentals' sudah ada.");
    }
  } catch (error) {
    console.error("❌ Gagal membuat koleksi 'rentals':", error);
  }
}

// Fungsi untuk mendapatkan database
function getDB() {
  if (!db) {
    throw new Error("Database belum terhubung. Pastikan connectDB() dipanggil terlebih dahulu.");
  }
  return db;
}

// Fungsi untuk mendapatkan koleksi users
function getUsersCollection() {
  return getDB().collection("users");
}

// Fungsi untuk mendapatkan koleksi rentals
function getRentalsCollection() {
  return getDB().collection("rentals");
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
  getUsersCollection,
  getRentalsCollection,
  closeDB,
};
