import { NextResponse } from "next/server";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { queryOrFallback } from "@/db/with-fallback";
import { fallbackOffers } from "@/data/fallback";

export async function GET() {
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
