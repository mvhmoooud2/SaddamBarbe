import { NextResponse } from "next/server";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { eq } from "drizzle-orm";
import { queryOrFallback } from "@/db/with-fallback";
import { fallbackTestimonials } from "@/data/fallback";

export async function GET() {
  const data = await queryOrFallback(
    () =>
      db
        .select()
        .from(testimonials)
        .where(eq(testimonials.isActive, true))
        .orderBy(testimonials.id),
    fallbackTestimonials,
    "testimonials"
  );
  return NextResponse.json(data);
}
