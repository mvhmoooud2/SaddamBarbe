import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { isAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const UPLOAD_DIR = path.join(PUBLIC_DIR, "uploads");
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"];
const MAX_SIZE = 8 * 1024 * 1024; // 8 ميجا

/**
 * تخزين الصور المرفوعة:
 *   - الافتراضي «قاعدة البيانات» → الصور بتفضل موجودة على أي استضافة
 *     (حتى المجانية اللي بتمسح الملفات مع كل نشر زي Vercel).
 *   - لو عايز التخزين على قرص السيرفر حط MEDIA_STORAGE=disk في متغيرات البيئة.
 */
const useDiskStorage = process.env.MEDIA_STORAGE === "disk";

/** كل الصور المتاحة للاختيار: المرفوعة + صور المشروع */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  async function listDir(dir: string, prefix: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      return entries
        .filter(
          (entry) =>
            entry.isFile() &&
            IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())
        )
        .map((entry) => `${prefix}/${entry.name}`)
        .sort();
    } catch {
      return [];
    }
  }

  async function listMedia() {
    try {
      const rows = await db
        .select({ id: media.id })
        .from(media)
        .orderBy(desc(media.id))
        .limit(200);
      return rows.map((row) => `/api/media/${row.id}`);
    } catch {
      return [];
    }
  }

  const [uploaded, diskUploads, images] = await Promise.all([
    listMedia(),
    listDir(UPLOAD_DIR, "/uploads"),
    listDir(path.join(PUBLIC_DIR, "images"), "/images"),
  ]);

  return NextResponse.json({ images: [...uploaded, ...diskUploads, ...images] });
}

/** رفع صورة جديدة → بترجع المسار اللي تحطه في أي حقل صورة */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "مفيش ملف" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "حجم الصورة كبير (الحد الأقصى 8 ميجا)" },
      { status: 400 }
    );
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(extension)) {
    return NextResponse.json(
      { error: "نوع الملف مش مدعوم (JPG / PNG / WEBP / GIF)" },
      { status: 400 }
    );
  }

  const safeName =
    path
      .basename(file.name, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 40) || "image";
  const fileName = `${Date.now()}-${safeName}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // (1) التخزين على قرص السيرفر — لو مفعّل بـ MEDIA_STORAGE=disk
  if (useDiskStorage) {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOAD_DIR, fileName), buffer);
      return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 });
    } catch (error) {
      console.error("[admin] فشل حفظ الصورة على القرص:", error);
      return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
    }
  }

  // (2) الافتراضي: التخزين في قاعدة البيانات
  try {
    const [row] = await db
      .insert(media)
      .values({
        fileName,
        mimeType: file.type || `image/${extension.replace(".", "")}`,
        sizeBytes: buffer.length,
        data: buffer.toString("base64"),
      })
      .returning({ id: media.id });

    return NextResponse.json({ url: `/api/media/${row.id}` }, { status: 201 });
  } catch (error) {
    console.error("[admin] فشل رفع الصورة لقاعدة البيانات:", error);
    return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
  }
}
