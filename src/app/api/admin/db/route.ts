import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { isAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** الجداول المسموح بعرضها (قراءة فقط) */
export const DB_TABLES: { name: string; labelAr: string }[] = [
  { name: "services", labelAr: "الخدمات" },
  { name: "offers", labelAr: "العروض" },
  { name: "branches", labelAr: "الفروع" },
  { name: "gallery_images", labelAr: "معرض الصور" },
  { name: "barbers", labelAr: "الفريق" },
  { name: "testimonials", labelAr: "آراء العملاء" },
  { name: "appointments", labelAr: "الحجوزات" },
  { name: "site_settings", labelAr: "إعدادات الموقع" },
];

/**
 * تصفّح محتوى قاعدة البيانات من لوحة التحكم (قراءة فقط).
 *   /api/admin/db              → أسماء الجداول وعدد الصفوف
 *   /api/admin/db?table=offers → أول 200 صف من الجدول
 */
export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const table = new URL(request.url).searchParams.get("table");

  try {
    if (!table) {
      const tables = await Promise.all(
        DB_TABLES.map(async (item) => {
          const result = await db.execute(
            sql.raw(`select count(*)::int as count from "${item.name}"`)
          );
          const rows = result.rows as { count: number }[];
          return { ...item, count: rows[0]?.count ?? 0 };
        })
      );
      return NextResponse.json({ tables });
    }

    if (!DB_TABLES.some((item) => item.name === table)) {
      return NextResponse.json({ error: "جدول غير معروف" }, { status: 404 });
    }

    const result = await db.execute(
      sql.raw(`select * from "${table}" limit 200`)
    );
    const rows = result.rows as Record<string, unknown>[];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return NextResponse.json({ table, columns, rows });
  } catch (error) {
    console.error("[admin] فشل قراءة قاعدة البيانات:", error);
    return NextResponse.json(
      { error: "تعذّر الاتصال بقاعدة البيانات" },
      { status: 503 }
    );
  }
}
