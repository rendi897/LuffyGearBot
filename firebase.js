const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://luffybotv12.firebaseio.com", // Ganti dengan URL proyek Anda
});

const db = admin.firestore();

module.exports = db;
