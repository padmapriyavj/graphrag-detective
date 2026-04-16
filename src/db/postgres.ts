import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT as string),
      database: process.env.PG_DATABASE,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
    });

    pool.on("error", (err) => {
      console.error("unexpected PostgreSQL pool error:", err);
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
  }
}
