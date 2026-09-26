import { NextResponse } from "next/server";
import { db } from "@/db";
import { barbers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { queryOrFallback } from "@/db/with-fallback";
import { fallbackBarbers } from "@/data/fallback";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClientServer();
      const { data, error } = await supabase
        .from("barbers")
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
            roleAr: row.role_ar,
            roleEn: row.role_en,
            bioAr: row.bio_ar,
            bioEn: row.bio_en,
            imageUrl: row.image_url,
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
        .from(barbers)
        .where(eq(barbers.isActive, true))
        .orderBy(barbers.id),
    fallbackBarbers,
    "barbers"
  );
  return NextResponse.json(data);
}
