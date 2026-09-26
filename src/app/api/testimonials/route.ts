import { NextResponse } from "next/server";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { eq } from "drizzle-orm";
import { queryOrFallback } from "@/db/with-fallback";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClientServer();
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      if (!error && data) {
        return NextResponse.json(
          data.map((row: any) => ({
            id: row.id,
            customerName: row.customer_name,
            commentAr: row.comment_ar,
            commentEn: row.comment_en,
            rating: row.rating,
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
        .from(testimonials)
        .where(eq(testimonials.isActive, true))
        .orderBy(testimonials.id),
    [],
    "testimonials"
  );
  return NextResponse.json(data);
}
