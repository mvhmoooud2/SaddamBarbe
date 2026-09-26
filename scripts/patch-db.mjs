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

// تقسيم الملف لجُمل مفردة (مفيش دوال أو ; جوه نصوص هنا)
const statements = sql
  .split(";")
  .map((s) =>
    s
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim()
  )
  .filter((s) => s.length > 0);

const pool = new Pool({ connectionString: url });

let ok = 0;
let skipped = 0;

for (const statement of statements) {
  try {
    await pool.query(statement);
    ok++;
  } catch (error) {
    // مش بنوقف — بنكمّل باقي الجُمل
    skipped++;
    const firstLine = statement.split("\n")[0];
    console.warn(`⚠️  تخطّي جملة (${error.code || "خطأ"}): ${firstLine}`);
  }
}

await pool.end();
console.log(`\n✅ ترقيع قاعدة البيانات خلص — نجح ${ok}، اتخطّى ${skipped}.`);
process.exit(0);
