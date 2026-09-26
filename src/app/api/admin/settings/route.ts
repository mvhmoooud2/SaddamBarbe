import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { isAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const rows = await db.select().from(siteSettings).orderBy(siteSettings.key);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[admin] فشل تحميل الإعدادات:", err);
    return NextResponse.json({ error: "قاعدة البيانات مش متاحة" }, { status: 503 });
  }
}

/** حفظ/تحديث إعداد (key + value) */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const key = (body as { key?: unknown } | null)?.key;
  const value = (body as { value?: unknown } | null)?.value;
  const labelAr = (body as { labelAr?: unknown } | null)?.labelAr;

  if (typeof key !== "string" || !key.trim()) {
    return NextResponse.json({ error: "المفتاح مطلوب" }, { status: 400 });
  }

  try {
    const [row] = await db
      .insert(siteSettings)
      .values({
        key: key.trim(),
        value: value === null || value === undefined ? null : String(value),
        labelAr: typeof labelAr === "string" ? labelAr : null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: value === null || value === undefined ? null : String(value),
          updatedAt: new Date(),
        },
      })
      .returning();
    return NextResponse.json(row);
  } catch (err) {
    console.error("[admin] فشل حفظ الإعداد:", err);
    return NextResponse.json({ error: "مش قادرين نحفظ دلوقتي" }, { status: 503 });
  }
}
