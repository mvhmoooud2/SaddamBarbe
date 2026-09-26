import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { isAuthenticated } from "@/lib/admin-auth";
import { adminTables, coerceValues } from "@/lib/admin-tables";

type Params = { params: Promise<{ table: string; id: string }> };

async function guard(table: string, id: string) {
  if (!(await isAuthenticated())) {
    return { error: NextResponse.json({ error: "غير مصرّح" }, { status: 401 }) };
  }
  const def = adminTables[table];
  if (!def) {
    return { error: NextResponse.json({ error: "جدول غير معروف" }, { status: 404 }) };
  }
  const rowId = Number(id);
  if (!Number.isInteger(rowId)) {
    return { error: NextResponse.json({ error: "رقم غير صحيح" }, { status: 400 }) };
  }
  return { def, rowId };
}

/** تعديل صف */
export async function PATCH(request: Request, { params }: Params) {
  const { table, id } = await params;
  const { def, rowId, error } = await guard(table, id);
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const values = coerceValues(def!, body as Record<string, unknown>);
  if (Object.keys(values).length === 0) {
    return NextResponse.json({ error: "مفيش حاجة اتغيرت" }, { status: 400 });
  }

  try {
    // @ts-expect-error جدول ديناميكي
    const [row] = await db.update(def!.table).set(values).where(eq(def!.table.id, rowId)).returning();
    if (!row) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    console.error(`[admin] فشل التعديل في ${table}:`, err);
    return NextResponse.json({ error: "مش قادرين نحفظ دلوقتي" }, { status: 503 });
  }
}

/** حذف صف */
export async function DELETE(_request: Request, { params }: Params) {
  const { table, id } = await params;
  const { def, rowId, error } = await guard(table, id);
  if (error) return error;

  try {
    // @ts-expect-error جدول ديناميكي
    await db.delete(def!.table).where(eq(def!.table.id, rowId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[admin] فشل الحذف من ${table}:`, err);
    return NextResponse.json(
      { error: "مش قادرين نحذف (ممكن يكون مرتبط بحجوزات)" },
      { status: 503 }
    );
  }
}
