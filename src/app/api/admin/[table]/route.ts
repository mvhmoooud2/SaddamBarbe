import { NextResponse } from "next/server";
import { db } from "@/db";
import { isAuthenticated } from "@/lib/admin-auth";
import { adminTables, coerceValues } from "@/lib/admin-tables";
import type { PgTable } from "drizzle-orm/pg-core";

type Params = { params: Promise<{ table: string }> };

async function guard(table: string) {
  if (!(await isAuthenticated())) {
    return { error: NextResponse.json({ error: "غير مصرّح" }, { status: 401 }) };
  }
  const def = adminTables[table];
  if (!def) {
    return { error: NextResponse.json({ error: "جدول غير معروف" }, { status: 404 }) };
  }
  return { def };
}

/** قراءة كل الصفوف (شامل المخفي) */
export async function GET(_request: Request, { params }: Params) {
  const { table } = await params;
  const { def, error } = await guard(table);
  if (error) return error;

  try {
    const rows = await db.select().from(def!.table as PgTable);
    return NextResponse.json(rows);
  } catch (err) {
    console.error(`[admin] فشل تحميل ${table}:`, err);
    return NextResponse.json(
      { error: "مش قادرين نوصل لقاعدة البيانات — اتأكد من DATABASE_URL" },
      { status: 503 }
    );
  }
}

/** إضافة صف جديد */
export async function POST(request: Request, { params }: Params) {
  const { table } = await params;
  const { def, error } = await guard(table);
  if (error) return error;

  if (def!.readonlyCreate) {
    return NextResponse.json({ error: "مش مسموح بالإضافة هنا" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const values = coerceValues(def!, body as Record<string, unknown>);

  for (const field of def!.fields) {
    if (field.required && (values[field.name] === null || values[field.name] === undefined)) {
      return NextResponse.json({ error: `${field.label} مطلوب` }, { status: 400 });
    }
  }

  try {
    const [row] = await db.insert(def!.table).values(values).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error(`[admin] فشل الإضافة في ${table}:`, err);
    return NextResponse.json({ error: "مش قادرين نحفظ دلوقتي" }, { status: 503 });
  }
}
