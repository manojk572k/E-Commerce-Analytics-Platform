const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing in .env file");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .query("SELECT NOW()")
  .then((res) => {
    console.log("✅ DB Connected:", res.rows[0]);
  })
  .catch((err) => {
    console.error("❌ DB Error:", err.message);
  });

module.exports = pool;