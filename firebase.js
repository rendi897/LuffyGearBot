const admin = require('firebase-admin');

let serviceAccount;

// Cek apakah kredensial dari variabel lingkungan tersedia
if (process.env.FIREBASE_CREDENTIALS) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    } catch (error) {
        console.error("Error parsing FIREBASE_CREDENTIALS:", error);
    }
} else {
    console.error("FIREBASE_CREDENTIALS not found. Make sure it's set in environment variables.");
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://luffybotv12.firebaseio.com" // Ganti dengan project ID Anda
    });
} else {
    console.error("Firebase Admin SDK failed to initialize. Check your credentials.");
}

const db = admin.firestore();
module.exports = { admin, db };
