import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { queryOrFallback } from "@/db/with-fallback";
import { fallbackServices } from "@/data/fallback";

export async function GET() {
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
