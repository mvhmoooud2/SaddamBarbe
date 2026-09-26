// فحص سريع للاتصال بقاعدة البيانات وعرض عدد الصفوف في كل جدول
//   npm run db:check
import "dotenv/config";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ مفيش DATABASE_URL في ملف .env");
  process.exit(1);
}

const host = url.split("@")[1]?.split("/")[0] ?? "?";
const client = new pg.Client({
  connectionString: url,
  ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

try {
  await client.connect();
  console.log(`✅ الاتصال نجح: ${host}`);
  for (const table of ["services", "offers", "barbers", "testimonials", "appointments", "site_settings"]) {
    try {
      const { rows } = await client.query(`select count(*)::int as n from public.${table}`);
      console.log(`   ${table.padEnd(14)} ${rows[0].n} صف`);
    } catch {
      console.log(`   ${table.padEnd(14)} ❌ الجدول مش موجود — شغّل supabase/ALL-IN-ONE.sql`);
    }
  }
} catch (error) {
  console.error(`❌ فشل الاتصال بـ ${host}`);
  console.error(`   ${error.message}`);
  console.error("   جرّب رابط الـ Connection pooling (بورت 6543) من Supabase.");
} finally {
  await client.end().catch(() => {});
}
