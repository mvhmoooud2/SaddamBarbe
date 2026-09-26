import { NextResponse } from "next/server";
import { count } from "drizzle-orm";
import { db } from "@/db";
import {
  appointments,
  barbers,
  branches,
  galleryImages,
  media,
  offers,
  services,
  siteSettings,
  testimonials,
} from "@/db/schema";
import { isAuthenticated } from "@/lib/admin-auth";
import { createClientServer } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { objectToCamel } from "@/lib/admin-tables";

export const dynamic = "force-dynamic";

const TABLE_DEFINITIONS = [
  { name: "services", labelAr: "الخدمات", drizzle: services },
  { name: "offers", labelAr: "العروض", drizzle: offers },
  { name: "branches", labelAr: "الفروع", drizzle: branches },
  { name: "gallery_images", labelAr: "معرض الصور", drizzle: galleryImages },
  { name: "barbers", labelAr: "الفريق", drizzle: barbers },
  { name: "testimonials", labelAr: "آراء العملاء", drizzle: testimonials },
  { name: "appointments", labelAr: "الحجوزات", drizzle: appointments },
  { name: "site_settings", labelAr: "إعدادات الموقع", drizzle: siteSettings },
  { name: "media", labelAr: "الوسائط المرفوعة", drizzle: media },
];

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get("table");

  // (1) لو تم طلب جدول معيّن
  if (tableName) {
    const tableDef = TABLE_DEFINITIONS.find((t) => t.name === tableName);
    if (!tableDef) {
      return NextResponse.json({ error: "جدول غير معروف" }, { status: 404 });
    }

    if (isSupabaseConfigured) {
      try {
        const supabase = (await createClientServer()) || createAdminClient();
        if (supabase) {
          const { data, error } = await supabase
            .from(tableName as any)
            .select("*")
            .limit(200);

          if (!error && data) {
            const columns = data.length > 0 ? Object.keys(data[0]) : [];
            return NextResponse.json({
              table: tableName,
              labelAr: tableDef.labelAr,
              columns,
              rows: data,
              source: "supabase",
            });
          }
        }
      } catch (e) {
        console.warn("[admin-db] Supabase table query error:", e);
      }
    }

    // fallback to Drizzle
    try {
      const rows = (await db
        .select()
        .from(tableDef.drizzle)
        .limit(200)) as Record<string, unknown>[];
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      return NextResponse.json({
        table: tableName,
        labelAr: tableDef.labelAr,
        columns,
        rows,
        source: "postgres",
      });
    } catch (e) {
      return NextResponse.json(
        { error: "فشل قراءة محتوى الجدول" },
        { status: 500 }
      );
    }
  }

  // (2) قائمة كل الجداول وعدد الصفوف
  const results = [];

  for (const item of TABLE_DEFINITIONS) {
    let rowCount = 0;

    if (isSupabaseConfigured) {
      try {
        const supabase = (await createClientServer()) || createAdminClient();
        if (supabase) {
          const { count: c, error } = await supabase
            .from(item.name as any)
            .select("*", { count: "exact", head: true });
          if (!error && c !== null) {
            rowCount = c;
          }
        }
      } catch {
        // ignore
      }
    }

    if (rowCount === 0) {
      try {
        const [c] = await db.select({ value: count() }).from(item.drizzle);
        rowCount = c.value;
      } catch {
        // ignore
      }
    }

    results.push({
      name: item.name,
      labelAr: item.labelAr,
      count: rowCount,
    });
  }

  return NextResponse.json({
    tables: results,
    supabaseConfigured: isSupabaseConfigured,
  });
}
