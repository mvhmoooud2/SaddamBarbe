import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const LOCAL_DEV_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const databaseUrl =
  process.env.DATABASE_URL ??
  (process.env.NODE_ENV === "production" ? undefined : LOCAL_DEV_DATABASE_URL);

// النسخة الثابتة (GitHub Pages) مش بتستخدم قاعدة البيانات أصلاً،
// فمش هنرمي خطأ لو مفيش DATABASE_URL — الـ Pool بيتعمل كسول ومش بيتصل إلا عند الاستخدام
const isStaticExport = process.env.STATIC_EXPORT === "1";

if (!databaseUrl && !isStaticExport) {
  // بدل ما الموقع يفصل خالص، بنكمّل بالبيانات الثابتة (fallback)
  // وبنسجّل تحذير واضح علشان المشكلة تبان في اللوجز
  console.warn(
    "[db] متغير DATABASE_URL غير موجود — الموقع شغال بالبيانات الثابتة من src/data/seed-data.ts"
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

/**
 * قواعد البيانات السحابية (Supabase مثلاً) بتحتاج SSL.
 * لو الرابط مش محلي بنفعّل SSL تلقائياً (Supabase بيستخدم شهادة مش موجودة
 * في مخزن الشهادات بتاع Node، فبنقبلها من غير تحقق زي ما هو موصى به عندهم).
 */
function sslConfig(url?: string) {
  if (!url) return undefined;
  if (/localhost|127\.0\.0\.1/.test(url)) return undefined;
  if (/sslmode=disable/.test(url)) return undefined;
  return { rejectUnauthorized: false };
}

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: sslConfig(databaseUrl),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
