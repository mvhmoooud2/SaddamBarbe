import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const UPLOAD_DIR = path.join(PUBLIC_DIR, "uploads");
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"];
const MAX_SIZE = 8 * 1024 * 1024; // 8 ميجا

/** كل الصور الموجودة في public/images و public/uploads (لاختيارها من اللوحة) */
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

  const [images, uploads] = await Promise.all([
    listDir(path.join(PUBLIC_DIR, "images"), "/images"),
    listDir(UPLOAD_DIR, "/uploads"),
  ]);

  return NextResponse.json({ images: [...uploads, ...images] });
}

/** رفع صورة جديدة → بتترفع في public/uploads وبيرجع مسارها */
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

  const safeName = path
    .basename(file.name, extension)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 40) || "image";
  const fileName = `${Date.now()}-${safeName}${extension}`;

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), buffer);
    return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 });
  } catch (error) {
    console.error("[admin] فشل رفع الصورة:", error);
    return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
  }
}
