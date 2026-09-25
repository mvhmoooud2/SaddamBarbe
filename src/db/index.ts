import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const LOCAL_DEV_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const databaseUrl =
  process.env.DATABASE_URL ??
  (process.env.NODE_ENV === "production" ? undefined : LOCAL_DEV_DATABASE_URL);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
