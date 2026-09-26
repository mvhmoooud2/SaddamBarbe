import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { isAuthenticated } from "@/lib/admin-auth";
import { getResource } from "@/data/admin-fields";
import { getTable, sanitizeBody } from "@/lib/admin-tables";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ resource: string; id: string }> };

async function resolve(params: Params["params"]) {
  const { resource, id } = await params;
  const definition = getResource(resource);
  const config = getTable(resource);
  const numericId = Number(id);
  return { resource, definition, config, numericId };
}

/** تعديل صف */
export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { resource, definition, config, numericId } = await resolve(params);
  if (!definition || !config || !Number.isInteger(numericId)) {
    return NextResponse.json({ error: "طلب غير صحيح" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const { values, errors } = sanitizeBody(
    resource,
    body as Record<string, unknown>,
    { partial: true }
  );
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("، ") }, { status: 400 });
  }
  if (Object.keys(values).length === 0) {
    return NextResponse.json({ error: "مفيش حاجة اتغيّرت" }, { status: 400 });
  }

  try {
    const [row] = await db
      .update(config.table)
      .set(values)
      .where(eq(config.table.id, numericId))
      .returning();

    if (!row) {
      return NextResponse.json({ error: "الصف مش موجود" }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (error) {
    console.error(`[admin] فشل تعديل ${resource}:`, error);
    return NextResponse.json(
      { error: "مش قادرين نحفظ التعديل دلوقتي" },
      { status: 503 }
    );
  }
}

/** حذف صف */
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { resource, definition, config, numericId } = await resolve(params);
  if (!definition || !config || !Number.isInteger(numericId)) {
    return NextResponse.json({ error: "طلب غير صحيح" }, { status: 400 });
  }

  try {
    await db.delete(config.table).where(eq(config.table.id, numericId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`[admin] فشل حذف ${resource}:`, error);
    return NextResponse.json(
      {
        error:
          "مش قادرين نحذف الصف ده — غالباً مرتبط بحجوزات. جرّب تخفيه بدل ما تحذفه.",
      },
      { status: 409 }
    );
  }
}
