import "dotenv/config";
import { db } from "./index";
import {
  services,
  barbers,
  testimonials,
  offers,
  branches,
  galleryImages,
  siteSettings,
  appointments,
} from "./schema";
import { servicesData, barbersData, offersData } from "@/data/seed-data";
import { enrichServices } from "@/data/service-enrich";
import { branches as branchesData } from "@/data/branches";
import { galleryData } from "@/data/gallery";
import { defaultSettings } from "@/data/settings-schema";

/**
 * زرع البيانات الأساسية.
 *
 * ⚠️ السكربت ده بيمسح محتوى الجداول ويرجّعها للبيانات الافتراضية،
 * فمتشغلوش بعد ما تبدأ تعدّل من لوحة التحكم إلا لو عايز ترجع من الأول.
 * (الحجوزات مش بتتمسح)
 */
async function seed() {
  await db.delete(appointments);
  await db.delete(testimonials);
  await db.delete(barbers);
  await db.delete(services);
  await db.delete(offers);
  await db.delete(branches);
  await db.delete(galleryImages);
  await db.delete(siteSettings);

  await db.insert(services).values(enrichServices(servicesData));
  await db.insert(barbers).values(
    barbersData.map((barber, index) => ({ ...barber, sortOrder: (index + 1) * 10 }))
  );
  await db.insert(offers).values(
    offersData.map((offer, index) => ({ ...offer, sortOrder: (index + 1) * 10 }))
  );

  await db.insert(branches).values(
    branchesData.map((branch, index) => ({
      slug: branch.id,
      nameAr: branch.nameAr,
      listingNameAr: branch.listingNameAr ?? null,
      badgeAr: branch.badgeAr ?? null,
      addressAr: branch.addressAr,
      landmarkAr: branch.landmarkAr ?? null,
      summaryAr: branch.summaryAr ?? null,
      phoneDisplay: branch.phoneDisplay,
      phoneHref: branch.phoneHref,
      whatsapp: branch.whatsapp,
      hoursAr: branch.hoursAr,
      lat: branch.lat ?? null,
      lng: branch.lng ?? null,
      priceListImage: branch.priceListImage ?? null,
      googleRating: branch.googleRating ?? null,
      googleReviews: branch.googleReviews ?? null,
      mapsUrl: branch.mapsUrl ?? null,
      sortOrder: (index + 1) * 10,
      isActive: true,
    }))
  );

  await db.insert(galleryImages).values(
    galleryData.map((image, index) => ({
      src: image.src,
      alt: image.alt,
      sortOrder: (index + 1) * 10,
      isActive: true,
    }))
  );

  await db.insert(siteSettings).values(
    Object.entries(defaultSettings).map(([key, value]) => ({ key, value }))
  );

  console.log(
    `Database seeded successfully (${servicesData.length} خدمات، ${barbersData.length} حلاقين، ` +
      `${offersData.length} عروض، ${branchesData.length} فروع، ${galleryData.length} صور معرض، ` +
      `${Object.keys(defaultSettings).length} إعداد)`
  );
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
