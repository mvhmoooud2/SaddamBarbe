// ============================================================
//  تجهيز قاعدة البيانات وقت النشر (Vercel / Render / أي استضافة)
//
//  - لو DATABASE_URL موجود: بينشئ الجداول ويزرع البيانات أول مرة بس.
//  - لو مش موجود: بيطبع تحذير وبيكمّل عادي (الموقع هيشتغل بالبيانات الثابتة)
//    علشان النشر ما يفشلش بسبب قاعدة بيانات مش متظبطة لسه.
// ============================================================
import "dotenv/config";
import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL;

if (!url) {
  console.warn(
    "\n⚠️  متغير DATABASE_URL مش موجود — هيتم تخطي إنشاء الجداول والزرع.\n" +
      "   الموقع هيشتغل بالبيانات الثابتة، ولوحة التحكم /admin مش هتقدر تحفظ.\n" +
      "   ضيف DATABASE_URL في إعدادات الاستضافة وأعد النشر.\n"
  );
  process.exit(0);
}

function run(label, command) {
  console.log(`\n==> ${label}`);
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    // مش بنوقف النشر — الموقع بيشتغل بالبيانات الثابتة لو قاعدة البيانات وقعت
    console.warn(`⚠️  ${label} فشل: ${error.message}`);
  }
}

run("إنشاء/تحديث جداول قاعدة البيانات", "npx drizzle-kit push --force");
// ترقيع الأعمدة الناقصة على قواعد البيانات القديمة (آمن ويتكرر) —
// بيضمن إن أعمدة زي display_name_ar / category_ar / branch_slugs / is_featured
// تبقى موجودة حتى لو الـ push فوق فشل أو ماشتغلش صح.
run("ترقيع الأعمدة الناقصة (Idempotent)", "node scripts/patch-db.mjs");
run("زرع البيانات الافتراضية (أول مرة بس)", "npx tsx src/db/init.ts");
