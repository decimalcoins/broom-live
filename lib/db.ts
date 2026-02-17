import { Pool } from "pg"

// =========================================
// ✅ Prevent Neon Connection Explosion
// (Vercel Serverless Safe Pooling)
// =========================================

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined
}

export const db =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

// Save pool globally in dev
if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = db
}
