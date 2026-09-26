import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { isAuthenticated } from "@/lib/admin-auth";
import { mergeSettings, settingKeys, defaultSettings } from "@/data/settings-schema";
import { createClientServer } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  // (1) من Supabase
  if (isSupabaseConfigured) {
    try {
      const supabase = (await createClientServer()) || createAdminClient();
      if (supabase) {
        const { data, error } = await supabase.from("site_settings").select("*");
        if (!error && data && data.length > 0) {
          return NextResponse.json(mergeSettings(data));
        }
      }
    } catch (e) {
      console.warn("[admin-settings] Supabase get error:", e);
    }
  }

  // (2) من Drizzle
  try {
    const rows = await db.select().from(siteSettings);
    if (rows && rows.length > 0) {
      return NextResponse.json(mergeSettings(rows));
    }
  } catch (error) {
    console.warn("[admin-settings] Drizzle load failed, using default settings:", error);
  }

  // (3) Fallback للإعدادات الافتراضية
  return NextResponse.json({ ...defaultSettings });
}

/** حفظ الإعدادات */
export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const entries = Object.entries(body as Record<string, unknown>)
    .filter(([key]) => settingKeys.includes(key))
    .map(([key, value]) => ({
      key,
      value: value === null || value === undefined ? "" : String(value),
      updated_at: new Date().toISOString(),
    }));

  if (entries.length === 0) {
    return NextResponse.json({ error: "مفيش إعدادات للحفظ" }, { status: 400 });
  }

  // (1) في Supabase
  if (isSupabaseConfigured) {
    try {
      const supabase = (await createClientServer()) || createAdminClient();
      if (supabase) {
        const { error } = await supabase
          .from("site_settings")
          .upsert(entries as any, { onConflict: "key" });

        if (error) {
          console.error("[admin-settings] Supabase upsert error:", error);
          throw new Error(error.message);
        }

        const { data } = await supabase.from("site_settings").select("*");
        return NextResponse.json(mergeSettings(data || []));
      }
    } catch (e: any) {
      console.warn("[admin-settings] Supabase save error:", e);
    }
  }

  // (2) في Drizzle
  try {
    const drizzleEntries = entries.map((entry) => ({
      key: entry.key,
      value: entry.value,
      updatedAt: new Date(entry.updated_at),
    }));

    await db
      .insert(siteSettings)
      .values(drizzleEntries)
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: sql`excluded.value`,
          updatedAt: sql`now()`,
        },
      });

    const rows = await db.select().from(siteSettings);
    return NextResponse.json(mergeSettings(rows));
  } catch (error) {
    console.error("[admin] فشل حفظ الإعدادات:", error);
    return NextResponse.json(
      { error: "مش قادرين نحفظ الإعدادات دلوقتي" },
      { status: 503 }
    );
  }
}
