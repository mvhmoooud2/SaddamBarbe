import { NextResponse } from "next/server";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { queryOrFallback } from "@/db/with-fallback";
import { fallbackOffers } from "@/data/fallback";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClientServer();
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json(
          data.map((row: any) => ({
            id: row.id,
            titleAr: row.title_ar,
            titleEn: row.title_en,
            descriptionAr: row.description_ar,
            descriptionEn: row.description_en,
            detailsAr: row.details_ar,
            detailsEn: row.details_en,
            oldPrice: String(row.old_price),
            newPrice: String(row.new_price),
            imageUrl: row.image_url,
            badgeAr: row.badge_ar,
            validUntil: row.valid_until,
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
        .from(offers)
        .where(eq(offers.isActive, true))
        .orderBy(offers.id),
    fallbackOffers,
    "offers"
  );
  return NextResponse.json(data);
}
