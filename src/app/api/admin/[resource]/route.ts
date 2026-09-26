import { NextResponse } from "next/server";
import { db } from "@/db";
import { isAuthenticated } from "@/lib/admin-auth";
import { getResource } from "@/data/admin-fields";
import { getTable, listRows, sanitizeBody } from "@/lib/admin-tables";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ resource: string }> };

/** كل الصفوف (المفعّلة والمخفية) لمورد معيّن */
export async function GET(_request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { resource } = await params;
  if (!getResource(resource) || !getTable(resource)) {
    return NextResponse.json({ error: "مورد غير معروف" }, { status: 404 });
  }

  try {
    return NextResponse.json(await listRows(resource));
  } catch (error) {
    console.error(`[admin] فشل تحميل ${resource}:`, error);
    return NextResponse.json(
      { error: "تعذّر الاتصال بقاعدة البيانات" },
      { status: 503 }
    );
  }
}

/** إضافة صف جديد */
export async function POST(request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { resource } = await params;
  const definition = getResource(resource);
  const config = getTable(resource);
  if (!definition || !config) {
    return NextResponse.json({ error: "مورد غير معروف" }, { status: 404 });
  }
  if (definition.canCreate === false) {
    return NextResponse.json(
      { error: "مش ممكن تضيف صف جديد هنا" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const { values, errors } = sanitizeBody(
    resource,
    body as Record<string, unknown>,
    { partial: false }
  );
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("، ") }, { status: 400 });
  }

  try {
    const rows = (await db
      .insert(config.table)
      .values(values)
      .returning()) as Record<string, unknown>[];
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error(`[admin] فشل إضافة ${resource}:`, error);
    return NextResponse.json(
      { error: "مش قادرين نحفظ البيانات دلوقتي" },
      { status: 503 }
    );
  }
}
