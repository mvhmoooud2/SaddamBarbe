import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { isAuthenticated } from "@/lib/admin-auth";
import { createClientServer } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  STORAGE_BUCKET,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const UPLOAD_DIR = path.join(PUBLIC_DIR, "uploads");
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"];
const MAX_SIZE = 15 * 1024 * 1024; // 15 ميجا

/**
 * جلب قائمة الصور المتاحة
 */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  async function listLocalDir(dir: string, prefix: string) {
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

  const supabaseImages: string[] = [];

  // جلب الصور من Supabase Storage
  if (isSupabaseConfigured) {
    try {
      const supabase = (await createClientServer()) || createAdminClient();
      if (supabase) {
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .list("uploads", {
            limit: 100,
            sortBy: { column: "created_at", order: "desc" },
          });

        if (!error && data) {
          for (const item of data) {
            if (item.name && !item.name.startsWith(".")) {
              const { data: pub } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(`uploads/${item.name}`);
              if (pub?.publicUrl) {
                supabaseImages.push(pub.publicUrl);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("[upload-api] Supabase storage list error:", e);
    }
  }

  // صور الـ Disk والمشروع
  const [diskUploads, images] = await Promise.all([
    listLocalDir(UPLOAD_DIR, "/uploads"),
    listLocalDir(path.join(PUBLIC_DIR, "images"), "/images"),
  ]);

  // دمج الصور مع تجنب التكرار
  const allImages = Array.from(
    new Set([...supabaseImages, ...diskUploads, ...images])
  );

  return NextResponse.json({ images: allImages });
}

/**
 * رفع صورة جديدة
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "مفيش ملف مرفوع" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "حجم الصورة كبير (الحد الأقصى 15 ميجا)" },
      { status: 400 }
    );
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(extension)) {
    return NextResponse.json(
      { error: "نوع الملف مش مدعوم (JPG / PNG / WEBP / GIF / SVG)" },
      { status: 400 }
    );
  }

  const safeName =
    path
      .basename(file.name, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 35) || "image";
  const fileName = `uploads/${Date.now()}-${safeName}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // (1) الخيار الأول والأفضل: الرفع لـ Supabase Storage
  if (isSupabaseConfigured) {
    try {
      const supabase = (await createClientServer()) || createAdminClient();
      if (supabase) {
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, buffer, {
            contentType: file.type || `image/${extension.replace(".", "")}`,
            upsert: true,
          });

        if (!uploadError) {
          const { data: pub } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(fileName);

          // حفظ في جدول media في Supabase أيضاً
          try {
            await (supabase as any).from("media").insert({
              file_name: path.basename(fileName),
              file_url: pub.publicUrl,
              mime_type: file.type || `image/${extension.replace(".", "")}`,
              size_bytes: buffer.length,
            });
          } catch {
            // جدول media اختياري
          }

          return NextResponse.json(
            { url: pub.publicUrl, path: fileName },
            { status: 201 }
          );
        } else {
          console.warn("[upload-api] Supabase storage upload error, trying fallback:", uploadError);
        }
      }
    } catch (e) {
      console.warn("[upload-api] Supabase storage exception, trying fallback:", e);
    }
  }

  // (2) تخزين على قرص السيرفر لو MEDIA_STORAGE=disk
  if (process.env.MEDIA_STORAGE === "disk") {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const diskFileName = `${Date.now()}-${safeName}${extension}`;
      await fs.writeFile(path.join(UPLOAD_DIR, diskFileName), buffer);
      return NextResponse.json({ url: `/uploads/${diskFileName}` }, { status: 201 });
    } catch (error) {
      console.error("[upload-api] فشل حفظ الصورة على القرص:", error);
    }
  }

  // (3) تخزين في قاعدة بيانات Drizzle / Postgres كـ Base64
  try {
    const diskFileName = `${Date.now()}-${safeName}${extension}`;
    const [row] = await db
      .insert(media)
      .values({
        fileName: diskFileName,
        mimeType: file.type || `image/${extension.replace(".", "")}`,
        sizeBytes: buffer.length,
        data: buffer.toString("base64"),
      })
      .returning({ id: media.id });

    return NextResponse.json({ url: `/api/media/${row.id}` }, { status: 201 });
  } catch (error) {
    console.error("[upload-api] فشل رفع الصورة لقاعدة البيانات:", error);
    return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
  }
}

/**
 * حذف صورة
 */
export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pathParam = searchParams.get("path");

  if (!pathParam) {
    return NextResponse.json({ error: "مسار الصورة مطلوب" }, { status: 400 });
  }

  if (isSupabaseConfigured) {
    try {
      const supabase = (await createClientServer()) || createAdminClient();
      if (supabase) {
        // استخراج المسار النسبي داخل الـ Bucket
        const relativePath = pathParam.includes(STORAGE_BUCKET)
          ? pathParam.split(`${STORAGE_BUCKET}/`)[1]
          : pathParam;

        await supabase.storage.from(STORAGE_BUCKET).remove([relativePath]);
        return NextResponse.json({ ok: true });
      }
    } catch (e) {
      console.error("[upload-api] Delete error:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
