import "dotenv/config";
import { db } from "./index";
import { services, barbers, testimonials, offers } from "./schema";
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

  console.log(
    `Database seeded successfully (${servicesData.length} خدمات، ${barbersData.length} حلاقين، ${testimonialsData.length} آراء، ${offersData.length} عروض)`
  );
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
