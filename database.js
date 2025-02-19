const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon membutuhkan SSL
});

pool.connect()
    .then(() => console.log("✅ Database connected successfully to Neon"))
    .catch(err => console.error("❌ Database connection error:", err));

module.exports = pool;
