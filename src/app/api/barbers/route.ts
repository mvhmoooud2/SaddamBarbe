import { NextResponse } from "next/server";
import { db } from "@/db";
import { barbers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { queryOrFallback } from "@/db/with-fallback";
import { fallbackBarbers } from "@/data/fallback";

export async function GET() {
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
