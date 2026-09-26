import { createClient } from "./client";
import { createAdminClient } from "./admin";
import { STORAGE_BUCKET, isSupabaseConfigured } from "./config";

/**
 * رفع صورة إلى Supabase Storage.
 * بترجع الرابط العام للصورة لاستخدامه في قاعدة البيانات والموقع.
 */
export async function uploadImageToStorage(
  file: File,
  folder = "uploads"
): Promise<{ url: string; path: string; error?: string }> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured yet");
  }

  const supabase = createClient();
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 30);
  const fileName = `${folder}/${Date.now()}-${cleanBaseName}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: "31536000",
      upsert: true,
      contentType: file.type || `image/${fileExt}`,
    });

  if (uploadError) {
    console.error("[supabase-storage] Upload failed:", uploadError);
    return { url: "", path: "", error: uploadError.message };
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName);

  return { url: data.publicUrl, path: fileName };
}

/**
 * جلب قائمة كل الصور في الـ Bucket للاختيار منها في لوحة التحكم
 */
export async function listStorageImages(folder = "uploads") {
  if (!isSupabaseConfigured) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folder, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error || !data) return [];

    return data
      .filter((item) => item.name && !item.name.startsWith("."))
      .map((item) => {
        const fullPath = `${folder}/${item.name}`;
        const { data: publicData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(fullPath);
        return {
          name: item.name,
          path: fullPath,
          url: publicData.publicUrl,
          createdAt: item.created_at,
          size: item.metadata?.size,
          mimeType: item.metadata?.mimetype,
        };
      });
  } catch (err) {
    console.error("[supabase-storage] List error:", err);
    return [];
  }
}

/**
 * حذف صورة من Supabase Storage
 */
export async function deleteStorageImage(path: string) {
  if (!isSupabaseConfigured) return false;

  try {
    const supabase = createAdminClient() || createClient();
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    if (error) {
      console.error("[supabase-storage] Delete error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[supabase-storage] Delete exception:", err);
    return false;
  }
}
