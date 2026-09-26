import { NextResponse } from "next/server";
import { and, count, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import {
  appointments,
  barbers,
  branches,
  galleryImages,
  offers,
  services,
  testimonials,
} from "@/db/schema";
import { isAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** أرقام سريعة لصفحة «نظرة عامة» في لوحة التحكم */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  try {
    const [
      servicesTotal,
      servicesActive,
      offersActive,
      branchesActive,
      barbersActive,
      galleryTotal,
      testimonialsTotal,
      appointmentsTotal,
      appointmentsPending,
      appointmentsUpcoming,
      latest,
    ] = await Promise.all([
      db.select({ value: count() }).from(services),
      db
        .select({ value: count() })
        .from(services)
        .where(eq(services.isActive, true)),
      db.select({ value: count() }).from(offers).where(eq(offers.isActive, true)),
      db
        .select({ value: count() })
        .from(branches)
        .where(eq(branches.isActive, true)),
      db
        .select({ value: count() })
        .from(barbers)
        .where(eq(barbers.isActive, true)),
      db.select({ value: count() }).from(galleryImages),
      db.select({ value: count() }).from(testimonials),
      db.select({ value: count() }).from(appointments),
      db
        .select({ value: count() })
        .from(appointments)
        .where(eq(appointments.status, "pending")),
      db
        .select({ value: count() })
        .from(appointments)
        .where(
          and(
            gte(appointments.appointmentDate, startOfToday),
            eq(appointments.status, "confirmed")
          )
        ),
      db
        .select({
          id: appointments.id,
          customerName: appointments.customerName,
          customerPhone: appointments.customerPhone,
          appointmentDate: appointments.appointmentDate,
          status: appointments.status,
        })
        .from(appointments)
        .orderBy(desc(appointments.createdAt))
        .limit(5),
    ]);

    return NextResponse.json({
      services: servicesTotal[0].value,
      servicesActive: servicesActive[0].value,
      offersActive: offersActive[0].value,
      branches: branchesActive[0].value,
      barbers: barbersActive[0].value,
      gallery: galleryTotal[0].value,
      testimonials: testimonialsTotal[0].value,
      appointments: appointmentsTotal[0].value,
      appointmentsPending: appointmentsPending[0].value,
      appointmentsUpcoming: appointmentsUpcoming[0].value,
      latestAppointments: latest,
    });
  } catch (error) {
    console.error("[admin] فشل تحميل الإحصائيات:", error);
    return NextResponse.json(
      { error: "تعذّر الاتصال بقاعدة البيانات" },
      { status: 503 }
    );
  }
}
