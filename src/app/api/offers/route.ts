import { NextResponse } from "next/server";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db
    .select()
    .from(offers)
    .where(eq(offers.isActive, true))
    .orderBy(offers.id);
  return NextResponse.json(data);
}
