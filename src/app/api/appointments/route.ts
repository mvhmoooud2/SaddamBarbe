import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, barbers, services } from "@/db/schema";
import { and, eq, gte, lte, ne } from "drizzle-orm";

// مواعيد العمل بتوقيت القاهرة (الموقع بيخدم عملاء في مصر)
const OPENING_HOUR = 10;
const CLOSING_HOUR = 22;
const CAIRO_TIME_ZONE = "Africa/Cairo";

/** بيرجّع الساعة (0-23) بتوقيت القاهرة لأي تاريخ */
function cairoHour(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAIRO_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Number(parts.find((part) => part.type === "hour")?.value ?? "0");
}

/**
 * المواعيد المحجوزة (بدون أي بيانات شخصية للعملاء).
 * لو فيه ?date=YYYY-MM-DD بيرجّع مواعيد اليوم ده بس.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

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

    const { customerName, customerPhone, serviceId, barberId, appointmentDate, notes } =
      body as Record<string, unknown>;

    if (!customerName || !customerPhone || !serviceId || !appointmentDate) {
      return NextResponse.json(
        { error: "من فضلك اكمل البيانات المطلوبة (الاسم، الموبايل، الخدمة، الميعاد)" },
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

    // التحقق من ساعات العمل بتوقيت القاهرة (مش بتوقيت السيرفر)
    const hour = cairoHour(date);
    if (hour < OPENING_HOUR || hour >= CLOSING_HOUR) {
      return NextResponse.json(
        {
          error: `الحجز متاح من ${OPENING_HOUR}:00 صباحاً حتى ${CLOSING_HOUR}:00 مساءً (بتوقيت القاهرة)`,
        },
        { status: 400 }
      );
    }

    const serviceIdNumber = Number(serviceId);
    if (!Number.isInteger(serviceIdNumber)) {
      return NextResponse.json({ error: "الخدمة المختارة غير صحيحة" }, { status: 400 });
    }

    const [service] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.id, serviceIdNumber));

    if (!service) {
      return NextResponse.json({ error: "الخدمة المختارة غير موجودة" }, { status: 400 });
    }

    const barberIdNumber = barberId ? Number(barberId) : null;
    if (barberIdNumber !== null && !Number.isInteger(barberIdNumber)) {
      return NextResponse.json({ error: "الحلاق المختار غير صحيح" }, { status: 400 });
    }

    // الميعاد نفسه محجوز؟
    // - لو العميل اختار حلاق معيّن: نتأكد إن الحلاق ده فاضي في الميعاد ده.
    // - لو اختار "أي حلاق": نتأكد إن فيه حلاق فاضي (عدد الحجوزات < عدد الحلاقين).
    const sameSlot = await db
      .select({ id: appointments.id, barberId: appointments.barberId })
      .from(appointments)
      .where(
        and(
          eq(appointments.appointmentDate, date),
          ne(appointments.status, "cancelled")
        )
      );

    if (barberIdNumber !== null) {
      if (sameSlot.some((row) => row.barberId === barberIdNumber)) {
        return NextResponse.json(
          { error: "الحلاق ده عنده حجز في الميعاد ده، اختار ميعاد تاني أو حلاق تاني" },
          { status: 409 }
        );
      }
    } else {
      const activeBarbers = await db
        .select({ id: barbers.id })
        .from(barbers)
        .where(eq(barbers.isActive, true));

      const capacity = Math.max(activeBarbers.length, 1);
      if (sameSlot.length >= capacity) {
        return NextResponse.json(
          { error: "الميعاد ده مكتمل، اختار ميعاد تاني" },
          { status: 409 }
        );
      }
    }

    const [appointment] = await db
      .insert(appointments)
      .values({
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        serviceId: serviceIdNumber,
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
