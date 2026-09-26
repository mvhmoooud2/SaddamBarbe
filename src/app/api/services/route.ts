import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { queryOrFallback } from "@/db/with-fallback";
import { fallbackServices } from "@/data/fallback";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClientServer();
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json(
          data.map((row: any) => ({
            id: row.id,
            nameAr: row.name_ar,
            nameEn: row.name_en,
            displayNameAr: row.display_name_ar,
            categoryAr: row.category_ar,
            descriptionAr: row.description_ar,
            descriptionEn: row.description_en,
            price: String(row.price),
            durationMinutes: row.duration_minutes,
            imageUrl: row.image_url,
            branchSlugs: row.branch_slugs ?? "",
            isFeatured: row.is_featured ?? true,
            sortOrder: row.sort_order ?? 0,
            isActive: row.is_active ?? true,
          }))
        );
      }
    } catch {
      // fallback
    }
  }

  const data = await queryOrFallback(
    () =>
      db
        .select()
        .from(services)
        .where(eq(services.isActive, true))
        .orderBy(services.id),
    fallbackServices,
    "services"
  );
  return NextResponse.json(data);
}
