import { Pool } from "pg";
import "dotenv/config";
import { db } from "@/lib/db";


const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL not found in env");
}

export const db = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});
