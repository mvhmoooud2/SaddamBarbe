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
import { createClientServer } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fallbackServices, fallbackOffers, fallbackBarbers, fallbackGallery } from "@/data/fallback";
import { branches as staticBranches } from "@/data/branches";

export const dynamic = "force-dynamic";

/** أرقام سريعة لصفحة «نظرة عامة» في لوحة التحكم */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // (1) من Supabase
  if (isSupabaseConfigured) {
    try {
      const supabase = (await createClientServer()) || createAdminClient();
      if (supabase) {
        const [
          { count: servicesTotal },
          { count: servicesActive },
          { count: offersActive },
          { count: branchesActive },
          { count: barbersActive },
          { count: galleryTotal },
          { count: testimonialsTotal },
          { count: appointmentsTotal },
          { count: appointmentsPending },
          { data: latest },
        ] = await Promise.all([
          supabase.from("services").select("*", { count: "exact", head: true }),
          supabase
            .from("services")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true),
          supabase
            .from("offers").select("*", { count: "exact", head: true })
            .eq("is_active", true),
          supabase
            .from("branches").select("*", { count: "exact", head: true })
            .eq("is_active", true),
          supabase
            .from("barbers").select("*", { count: "exact", head: true })
            .eq("is_active", true),
          supabase.from("gallery_images").select("*", { count: "exact", head: true }),
          supabase.from("testimonials").select("*", { count: "exact", head: true }),
          supabase.from("appointments").select("*", { count: "exact", head: true }),
          supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("appointments")
            .select("id, customer_name, customer_phone, appointment_date, status, branch_slug")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        const mappedLatest = (latest || []).map((row: any) => ({
          id: row.id,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          appointmentDate: row.appointment_date,
          status: row.status,
          branchSlug: row.branch_slug,
        }));

        return NextResponse.json({
          services: servicesTotal ?? 0,
          servicesActive: servicesActive ?? 0,
          offersActive: offersActive ?? 0,
          branches: branchesActive ?? 0,
          barbers: barbersActive ?? 0,
          gallery: galleryTotal ?? 0,
          testimonials: testimonialsTotal ?? 0,
          appointments: appointmentsTotal ?? 0,
          appointmentsPending: appointmentsPending ?? 0,
          appointmentsUpcoming: 0,
          latestAppointments: mappedLatest,
          source: "supabase",
        });
      }
    } catch (e) {
      console.warn("[admin-stats] Supabase query failed, trying Drizzle:", e);
    }
  }

  // (2) من Drizzle / Postgres
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
      source: "postgres",
    });
  } catch (error) {
    // (3) Fallback للبيانات الافتراضية حتى تفتح لوحة التحكم فوراً بدون أخطاء
    return NextResponse.json({
      services: fallbackServices.length,
      servicesActive: fallbackServices.filter((s) => s.isActive).length,
      offersActive: fallbackOffers.filter((o) => o.isActive).length,
      branches: staticBranches.length,
      barbers: fallbackBarbers.filter((b) => b.isActive).length,
      gallery: fallbackGallery.length,
      testimonials: 0,
      appointments: 0,
      appointmentsPending: 0,
      appointmentsUpcoming: 0,
      latestAppointments: [],
      source: "fallback",
    });
  }
}
