import { NextResponse } from "next/server";
import { db } from "@/db";
import { barbers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db
    .select()
    .from(barbers)
    .where(eq(barbers.isActive, true))
    .orderBy(barbers.id);
  return NextResponse.json(data);
}
