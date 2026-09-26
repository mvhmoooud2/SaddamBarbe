// ============================================================
//  تشغيل ترقيع قاعدة البيانات (scripts/patch-db.sql)
//
//  بيضيف أي أعمدة/جداول ناقصة من غير ما يمسح بيانات — آمن يتكرر.
//  بيتنفّذ كل جملة لوحدها وبيكمّل لو واحدة فشلت، علشان مشكلة في
//  جدول واحد ماتوقّفش باقي الترقيع.
//
//  الاستخدام:
//    npm run db:patch        (لازم DATABASE_URL يكون متظبط)
// ============================================================
import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const url = process.env.DATABASE_URL;

if (!url) {
  console.warn(
    "\n⚠️  متغير DATABASE_URL مش موجود — هيتم تخطي ترقيع قاعدة البيانات.\n"
  );
  process.exit(0);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "patch-db.sql");
const sql = readFileSync(sqlPath, "utf8");

const pool = new Pool({ connectionString: url });

try {
  // الملف كله عبارة عن بلوك DO $$ ... $$ واحد بيتخطّى الجداول الناقصة لوحده،
  // فبننفّذه مرة واحدة (مينفعش نقسّمه على ; بسبب الـ ; اللي جوه البلوك).
  await pool.query(sql);
  console.log("\n✅ ترقيع قاعدة البيانات خلص بنجاح.");
} catch (error) {
  console.warn(`⚠️  ترقيع قاعدة البيانات فشل: ${error.message}`);
} finally {
  await pool.end();
}

process.exit(0);
