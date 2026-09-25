import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  let query = db.select().from(appointments);

  if (dateParam) {
    const date = new Date(dateParam);
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));
    query = query.where(
      and(
        gte(appointments.appointmentDate, start),
        lte(appointments.appointmentDate, end)
      )
    ) as typeof query;
  }

  const data = await query.orderBy(appointments.appointmentDate);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      serviceId,
      barberId,
      appointmentDate,
      notes,
    } = body;

    if (!customerName || !customerPhone || !serviceId || !appointmentDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const date = new Date(appointmentDate);
    const hour = date.getHours();

    if (hour < 10 || hour >= 22) {
      return NextResponse.json(
        { error: "Appointments are only available from 10:00 AM to 10:00 PM" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.appointmentDate, date),
          eq(appointments.status, "confirmed")
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    const [appointment] = await db
      .insert(appointments)
      .values({
        customerName,
        customerPhone,
        serviceId: Number(serviceId),
        barberId: barberId ? Number(barberId) : null,
        appointmentDate: date,
        notes: notes || null,
        status: "pending",
      })
      .returning();

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
