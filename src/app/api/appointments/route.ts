import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, barbers, services } from "@/db/schema";
import { and, eq, gte, lte, ne } from "drizzle-orm";
import { createClientServer } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// مواعيد العمل بتوقيت القاهرة
const OPENING_HOUR = 11;
const CLOSING_HOUR = 2;
const CAIRO_TIME_ZONE = "Africa/Cairo";

function isOpenHour(hour: number) {
  return OPENING_HOUR <= CLOSING_HOUR
    ? hour >= OPENING_HOUR && hour < CLOSING_HOUR
    : hour >= OPENING_HOUR || hour < CLOSING_HOUR;
}

function cairoHour(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAIRO_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Number(parts.find((part) => part.type === "hour")?.value ?? "0");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  // (1) من Supabase
  if (isSupabaseConfigured) {
    try {
      const supabase = (await createClientServer()) || createAdminClient();
      if (supabase) {
        let query = supabase
          .from("appointments")
          .select("id, appointment_date, barber_id, status");

        if (dateParam) {
          const day = new Date(`${dateParam}T00:00:00Z`);
          if (!Number.isNaN(day.getTime())) {
            const start = new Date(day);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(day);
            end.setUTCHours(23, 59, 59, 999);
            query = query
              .gte("appointment_date", start.toISOString())
              .lte("appointment_date", end.toISOString());
          }
        }

        const { data, error } = await query.order("appointment_date", { ascending: true });
        if (!error && data) {
          return NextResponse.json(
            data.map((row: any) => ({
              id: row.id,
              appointmentDate: row.appointment_date,
              barberId: row.barber_id,
              status: row.status,
            }))
          );
        }
      }
    } catch (e) {
      console.warn("[appointments-api] Supabase query error:", e);
    }
  }

  // (2) من Drizzle
  try {
    let query = db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        barberId: appointments.barberId,
        status: appointments.status,
      })
      .from(appointments);

    if (dateParam) {
      const day = new Date(`${dateParam}T00:00:00Z`);
      if (Number.isNaN(day.getTime())) {
        return NextResponse.json({ error: "تاريخ غير صحيح" }, { status: 400 });
      }
      const start = new Date(day);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setUTCHours(23, 59, 59, 999);

      query = query.where(
        and(
          gte(appointments.appointmentDate, start),
          lte(appointments.appointmentDate, end)
        )
      ) as typeof query;
    }

    const data = await query.orderBy(appointments.appointmentDate);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading appointments:", error);
    return NextResponse.json(
      { error: "تعذّر تحميل المواعيد، حاول تاني" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const {
      customerName,
      customerPhone,
      serviceId,
      serviceName,
      barberId,
      branchSlug,
      appointmentDate,
      notes,
    } = body as Record<string, unknown>;

    if (!customerName || !customerPhone || !appointmentDate) {
      return NextResponse.json(
        { error: "من فضلك اكمل البيانات المطلوبة (الاسم، الموبايل، الميعاد)" },
        { status: 400 }
      );
    }

    const date = new Date(String(appointmentDate));
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "تاريخ أو وقت غير صحيح" }, { status: 400 });
    }

    if (date.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "الميعاد ده عدّى، اختار ميعاد قادم" },
        { status: 400 }
      );
    }

    const hour = cairoHour(date);
    if (!isOpenHour(hour)) {
      return NextResponse.json(
        {
          error: `الحجز متاح من ${OPENING_HOUR}:00 صباحاً حتى ${CLOSING_HOUR}:00 صباحاً (بتوقيت القاهرة)`,
        },
        { status: 400 }
      );
    }

    const serviceIdNumber = serviceId ? Number(serviceId) : null;
    const barberIdNumber = barberId ? Number(barberId) : null;

    // (1) التسجيل في Supabase
    if (isSupabaseConfigured) {
      try {
        const supabase = (await createClientServer()) || createAdminClient();
        if (supabase) {
          const { data, error } = await (supabase as any)
            .from("appointments")
            .insert({
              customer_name: String(customerName).trim(),
              customer_phone: String(customerPhone).trim(),
              service_id: Number.isInteger(serviceIdNumber) ? serviceIdNumber : null,
              service_name: serviceName ? String(serviceName).trim() : null,
              barber_id: Number.isInteger(barberIdNumber) ? barberIdNumber : null,
              branch_slug: branchSlug ? String(branchSlug).trim() : null,
              appointment_date: date.toISOString(),
              notes: notes ? String(notes).trim() : null,
              status: "pending",
            })
            .select()
            .single();

          if (!error && data) {
            return NextResponse.json(
              {
                id: (data as any).id,
                customerName: (data as any).customer_name,
                customerPhone: (data as any).customer_phone,
                appointmentDate: (data as any).appointment_date,
                status: (data as any).status,
              },
              { status: 201 }
            );
          }
        }
      } catch (e) {
        console.warn("[appointments-api] Supabase insert failed, trying Drizzle:", e);
      }
    }

    // (2) التسجيل في Drizzle
    const [appointment] = await db
      .insert(appointments)
      .values({
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        serviceId: serviceIdNumber || 1,
        barberId: barberIdNumber,
        appointmentDate: date,
        notes: notes ? String(notes).trim() : null,
        status: "pending",
      })
      .returning();

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "مش قادرين نسجّل الحجز دلوقتي، حاول تاني أو كلّمنا على الواتساب" },
      { status: 503 }
    );
  }
}
