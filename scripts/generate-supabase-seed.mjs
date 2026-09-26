// ============================================================
//  بيولّد supabase/seed.sql من بيانات الموقع (src/data/seed-data.ts)
//  التشغيل:  npm run supabase:seed-sql
// ============================================================
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// بنقرأ الداتا عن طريق tsx علشان الملف TypeScript
const json = execFileSync(
  "npx",
  [
    "tsx",
    "-e",
    `import { servicesData, barbersData, testimonialsData, offersData } from "./src/data/seed-data";
     process.stdout.write(JSON.stringify({ servicesData, barbersData, testimonialsData, offersData }));`,
  ],
  { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }
);

const data = JSON.parse(json);

const q = (v) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};

function insert(table, columns, rows, keys) {
  if (!rows.length) return "";
  const values = rows
    .map((row) => `  (${keys.map((k) => q(row[k] ?? null)).join(", ")})`)
    .join(",\n");
  return `insert into public.${table} (${columns.join(", ")}) values\n${values};\n\n`;
}

let sql = `-- ============================================================
--  بيانات مبدئية لصالون صدام (متولّدة تلقائياً — لا تعدّلها يدوياً)
--  شغّل supabase/schema.sql الأول، بعدين الملف ده.
--  تحذير: الملف ده بيمسح المحتوى الحالي ويرجّعه للبيانات الأصلية.
-- ============================================================
begin;

truncate table public.appointments restart identity cascade;
truncate table public.testimonials restart identity cascade;
truncate table public.offers restart identity cascade;
truncate table public.barbers restart identity cascade;
truncate table public.services restart identity cascade;

`;

sql += insert(
  "services",
  ["name_ar", "name_en", "description_ar", "description_en", "price", "duration_minutes", "image_url", "is_active"],
  data.servicesData,
  ["nameAr", "nameEn", "descriptionAr", "descriptionEn", "price", "durationMinutes", "imageUrl", "isActive"]
);

sql += insert(
  "offers",
  ["title_ar", "title_en", "description_ar", "description_en", "details_ar", "details_en", "old_price", "new_price", "image_url", "badge_ar", "is_active"],
  data.offersData,
  ["titleAr", "titleEn", "descriptionAr", "descriptionEn", "detailsAr", "detailsEn", "oldPrice", "newPrice", "imageUrl", "badgeAr", "isActive"]
);

sql += insert(
  "barbers",
  ["name_ar", "name_en", "role_ar", "role_en", "bio_ar", "bio_en", "image_url", "is_active"],
  data.barbersData,
  ["nameAr", "nameEn", "roleAr", "roleEn", "bioAr", "bioEn", "imageUrl", "isActive"]
);

sql += insert(
  "testimonials",
  ["customer_name", "comment_ar", "comment_en", "rating", "is_active"],
  data.testimonialsData,
  ["customerName", "commentAr", "commentEn", "rating", "isActive"]
);

sql += `insert into public.site_settings (key, value, label_ar) values
  ('whatsapp', '201061402242', 'رقم الواتساب'),
  ('phone', '01061402242', 'رقم التليفون'),
  ('address', 'مدينة نصر، القاهرة', 'العنوان'),
  ('hours', 'يومياً من 11 صباحاً حتى 2 بعد منتصف الليل', 'مواعيد العمل')
on conflict (key) do nothing;

commit;
`;

writeFileSync(join(root, "supabase", "seed.sql"), sql, "utf8");
console.log("✅ تم إنشاء supabase/seed.sql");
