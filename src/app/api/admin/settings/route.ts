import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { isAuthenticated } from "@/lib/admin-auth";
import { mergeSettings, settingKeys } from "@/data/settings-schema";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const rows = await db.select().from(siteSettings);
    return NextResponse.json(mergeSettings(rows));
  } catch (error) {
    console.error("[admin] فشل تحميل الإعدادات:", error);
    return NextResponse.json(
      { error: "تعذّر الاتصال بقاعدة البيانات" },
      { status: 503 }
    );
  }
}

/** حفظ الإعدادات (المفاتيح المعروفة بس) */
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
      updatedAt: new Date(),
    }));

  if (entries.length === 0) {
    return NextResponse.json({ error: "مفيش إعدادات للحفظ" }, { status: 400 });
  }

  try {
    await db
      .insert(siteSettings)
      .values(entries)
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
