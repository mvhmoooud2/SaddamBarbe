import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(services.id);
  return NextResponse.json(data);
}
