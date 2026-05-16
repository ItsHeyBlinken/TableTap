import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  const tables = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name IN ('users', 'cards')
     ORDER BY table_name`
  );
  console.log("Tables found:", tables.rows.map((r) => r.table_name).join(", ") || "none");

  if (tables.rows.length === 2) {
    const cols = await pool.query(
      `SELECT COUNT(*)::int AS n FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'cards'`
    );
    console.log("cards column count:", cols.rows[0].n);
    console.log("Schema OK — ready for the API.");
  } else {
    console.log("Expected users + cards tables.");
    process.exit(1);
  }
} catch (err) {
  console.error("Check failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
