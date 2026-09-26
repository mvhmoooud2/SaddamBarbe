import "dotenv/config";
import { db } from "./index";
import { services, barbers, testimonials, offers, siteSettings } from "./schema";
import {
  servicesData,
  barbersData,
  testimonialsData,
  offersData,
} from "@/data/seed-data";

async function seed() {
  await db.delete(testimonials);
  await db.delete(barbers);
  await db.delete(services);
  await db.delete(offers);

  await db.insert(services).values(servicesData);
  await db.insert(barbers).values(barbersData);
  await db.insert(testimonials).values(testimonialsData);
  await db.insert(offers).values(offersData);

  // إعدادات عامة تتعدّل من لوحة التحكم /admin
  await db
    .insert(siteSettings)
    .values([
      { key: "whatsapp", value: "201061402242", labelAr: "رقم الواتساب" },
      { key: "phone", value: "01061402242", labelAr: "رقم التليفون" },
      { key: "address", value: "مدينة نصر، القاهرة", labelAr: "العنوان" },
      {
        key: "hours",
        value: "يومياً من 11 صباحاً حتى 2 بعد منتصف الليل",
        labelAr: "مواعيد العمل",
      },
    ])
    .onConflictDoNothing();

  console.log(
    `Database seeded successfully (${servicesData.length} خدمات، ${barbersData.length} حلاقين، ${testimonialsData.length} آراء، ${offersData.length} عروض)`
  );
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
