import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

/**
 * عرض صورة مرفوعة من لوحة التحكم (متخزنة في قاعدة البيانات).
 * مثال: /api/media/12
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id.split(".")[0]);

  if (!Number.isInteger(numericId)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const [row] = await db
      .select()
      .from(media)
      .where(eq(media.id, numericId))
      .limit(1);

    if (!row) return new Response("Not found", { status: 404 });

    const buffer = Buffer.from(row.data, "base64");
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": row.mimeType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[media] فشل عرض الصورة:", error);
    return new Response("Server error", { status: 500 });
  }
}
