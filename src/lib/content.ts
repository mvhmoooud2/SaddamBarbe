import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  services as servicesTable,
  offers as offersTable,
  barbers as barbersTable,
  branches as branchesTable,
  galleryImages as galleryTable,
  testimonials as testimonialsTable,
  siteSettings as settingsTable,
  type Service,
  type Offer,
  type Barber,
  type Testimonial,
  type BranchRow,
  type GalleryImage,
} from "@/db/schema";
import {
  fallbackServices,
  fallbackOffers,
  fallbackBarbers,
  fallbackGallery,
} from "@/data/fallback";
import { branches as staticBranches, type Branch } from "@/data/branches";
import {
  mergeSettings,
  defaultSettings,
  type SiteSettingsMap,
} from "@/data/settings-schema";

export type SiteContent = {
  services: Service[];
  offers: Offer[];
  barbers: Barber[];
  branches: Branch[];
  gallery: { src: string; alt: string }[];
  testimonials: Testimonial[];
  settings: SiteSettingsMap;
};

/** بيحوّل صف الفرع من قاعدة البيانات لنفس شكل الفرع المستخدم في الواجهة */
export function branchRowToBranch(row: BranchRow): Branch {
  return {
    id: row.slug,
    nameAr: row.nameAr,
    listingNameAr: row.listingNameAr ?? undefined,
    badgeAr: row.badgeAr ?? undefined,
    addressAr: row.addressAr,
    landmarkAr: row.landmarkAr ?? undefined,
    summaryAr: row.summaryAr ?? undefined,
    phoneDisplay: row.phoneDisplay,
    phoneHref: row.phoneHref,
    whatsapp: row.whatsapp,
    hoursAr: row.hoursAr,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    priceListImage: row.priceListImage ?? undefined,
    googleRating: row.googleRating ?? undefined,
    googleReviews: row.googleReviews ?? undefined,
    mapsUrl: row.mapsUrl ?? undefined,
  } as Branch;
}

function galleryRowsToItems(rows: GalleryImage[]) {
  return rows.map((row) => ({ src: row.src, alt: row.alt }));
}

/** محتوى الموقع الثابت — بيتستخدم في نسخة GitHub Pages أو لو الداتابيز مش متاحة */
export function staticContent(): SiteContent {
  return {
    services: fallbackServices,
    offers: fallbackOffers,
    barbers: fallbackBarbers,
    branches: staticBranches,
    gallery: fallbackGallery,
    testimonials: [],
    settings: { ...defaultSettings },
  };
}

/**
 * بيقرأ كل محتوى الموقع من قاعدة البيانات (الحاجات المفعّلة بس).
 * لو الداتابيز مش متاحة بيرجع المحتوى الثابت علشان الموقع مايفصلش.
 */
export async function loadSiteContent(): Promise<SiteContent> {
  if (process.env.STATIC_EXPORT === "1") return staticContent();

  try {
    const [
      services,
      offers,
      barbers,
      branchRows,
      galleryRows,
      testimonialRows,
      settingRows,
    ] = await Promise.all([
      db
        .select()
        .from(servicesTable)
        .where(eq(servicesTable.isActive, true))
        .orderBy(asc(servicesTable.sortOrder), asc(servicesTable.id)),
      db
        .select()
        .from(offersTable)
        .where(eq(offersTable.isActive, true))
        .orderBy(asc(offersTable.sortOrder), asc(offersTable.id)),
      db
        .select()
        .from(barbersTable)
        .where(eq(barbersTable.isActive, true))
        .orderBy(asc(barbersTable.sortOrder), asc(barbersTable.id)),
      db
        .select()
        .from(branchesTable)
        .where(eq(branchesTable.isActive, true))
        .orderBy(asc(branchesTable.sortOrder), asc(branchesTable.id)),
      db
        .select()
        .from(galleryTable)
        .where(eq(galleryTable.isActive, true))
        .orderBy(asc(galleryTable.sortOrder), asc(galleryTable.id)),
      db
        .select()
        .from(testimonialsTable)
        .where(eq(testimonialsTable.isActive, true))
        .orderBy(asc(testimonialsTable.sortOrder), asc(testimonialsTable.id)),
      db.select().from(settingsTable),
    ]);

    const fallback = staticContent();

    return {
      services: services.length > 0 ? services : fallback.services,
      offers,
      barbers: barbers.length > 0 ? barbers : fallback.barbers,
      branches:
        branchRows.length > 0
          ? branchRows.map(branchRowToBranch)
          : fallback.branches,
      gallery:
        galleryRows.length > 0
          ? galleryRowsToItems(galleryRows)
          : fallback.gallery,
      testimonials: testimonialRows,
      settings: mergeSettings(settingRows),
    };
  } catch (error) {
    console.warn(
      "[fallback] قاعدة البيانات غير متاحة — الموقع شغال بالبيانات الثابتة:",
      error
    );
    return staticContent();
  }
}
