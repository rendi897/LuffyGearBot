const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Ganti dengan file JSON Anda

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://luffybotv12.firebaseio.com", // Ganti dengan URL proyek Anda
});

const db = admin.firestore();

module.exports = db;
