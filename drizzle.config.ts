import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * إعدادات Drizzle — بتاخد رابط قاعدة البيانات من متغير البيئة DATABASE_URL
 * (على السيرفر بييجي من الاستضافة، وفي التطوير المحلي من ملف .env)
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
