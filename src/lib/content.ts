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
import { createClientServer } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";

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
export function branchRowToBranch(row: any): Branch {
  return {
    id: row.slug || String(row.id),
    nameAr: row.nameAr || row.name_ar,
    listingNameAr: row.listingNameAr ?? row.listing_name_ar ?? undefined,
    badgeAr: row.badgeAr ?? row.badge_ar ?? undefined,
    addressAr: row.addressAr || row.address_ar,
    landmarkAr: row.landmarkAr ?? row.landmark_ar ?? undefined,
    summaryAr: row.summaryAr ?? row.summary_ar ?? undefined,
    phoneDisplay: row.phoneDisplay || row.phone_display,
    phoneHref: row.phoneHref || row.phone_href,
    whatsapp: row.whatsapp,
    hoursAr: row.hoursAr || row.hours_ar,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    priceListImage: row.priceListImage ?? row.price_list_image ?? undefined,
    googleRating: row.googleRating ?? row.google_rating ?? undefined,
    googleReviews: row.googleReviews ?? row.google_reviews ?? undefined,
    mapsUrl: row.mapsUrl ?? row.maps_url ?? undefined,
  } as Branch;
}

function galleryRowsToItems(rows: (GalleryImage | { src: string; alt: string } | any)[]) {
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
 * جلب البيانات من Supabase
 */
async function loadFromSupabase(): Promise<SiteContent | null> {
  try {
    const supabase = await createClientServer();

    const [
      { data: services, error: sErr },
      { data: offers, error: oErr },
      { data: barbers, error: bErr },
      { data: branches, error: brErr },
      { data: gallery, error: gErr },
      { data: testimonials, error: tErr },
      { data: settings, error: stErr },
    ] = await Promise.all([
      supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
      supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
      supabase
        .from("barbers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
      supabase
        .from("branches")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
      supabase
        .from("gallery_images")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
      supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
      supabase.from("site_settings").select("*"),
    ]);

    if (sErr || oErr || brErr) {
      console.warn("[supabase] Error fetching from tables:", { sErr, oErr, brErr });
      return null;
    }

    const fallback = staticContent();

    // Mapping Supabase snake_case rows to camelCase
    const mappedServices: Service[] = (services || []).map((row: any) => ({
      id: row.id,
      nameAr: row.name_ar,
      nameEn: row.name_en,
      displayNameAr: row.display_name_ar,
      categoryAr: row.category_ar,
      descriptionAr: row.description_ar,
      descriptionEn: row.description_en,
      price: String(row.price),
      durationMinutes: row.duration_minutes,
      imageUrl: row.image_url,
      branchSlugs: row.branch_slugs ?? "",
      isFeatured: row.is_featured ?? true,
      sortOrder: row.sort_order ?? 0,
      isActive: row.is_active ?? true,
      createdAt: new Date(row.created_at || Date.now()),
    }));

    const mappedOffers: Offer[] = (offers || []).map((row: any) => ({
      id: row.id,
      titleAr: row.title_ar,
      titleEn: row.title_en,
      descriptionAr: row.description_ar,
      descriptionEn: row.description_en,
      detailsAr: row.details_ar,
      detailsEn: row.details_en,
      oldPrice: String(row.old_price),
      newPrice: String(row.new_price),
      imageUrl: row.image_url,
      badgeAr: row.badge_ar,
      validUntil: row.valid_until ? new Date(row.valid_until) : null,
      sortOrder: row.sort_order ?? 0,
      isActive: row.is_active ?? true,
      createdAt: new Date(row.created_at || Date.now()),
    }));

    const mappedBarbers: Barber[] = (barbers || []).map((row: any) => ({
      id: row.id,
      nameAr: row.name_ar,
      nameEn: row.name_en,
      roleAr: row.role_ar,
      roleEn: row.role_en,
      bioAr: row.bio_ar,
      bioEn: row.bio_en,
      imageUrl: row.image_url,
      sortOrder: row.sort_order ?? 0,
      isActive: row.is_active ?? true,
      createdAt: new Date(row.created_at || Date.now()),
    }));

    const mappedBranches: Branch[] =
      branches && branches.length > 0
        ? branches.map(branchRowToBranch)
        : fallback.branches;

    const mappedGallery =
      gallery && gallery.length > 0
        ? galleryRowsToItems(gallery)
        : fallback.gallery;

    const mappedTestimonials: Testimonial[] = (testimonials || []).map((row: any) => ({
      id: row.id,
      customerName: row.customer_name,
      commentAr: row.comment_ar,
      commentEn: row.comment_en,
      rating: row.rating,
      sortOrder: row.sort_order ?? 0,
      isActive: row.is_active ?? true,
      createdAt: new Date(row.created_at || Date.now()),
    }));

    const settingsRows = (settings || []).map((row: any) => ({
      key: row.key,
      value: row.value,
    }));

    return {
      services: mappedServices.length > 0 ? mappedServices : fallback.services,
      offers: mappedOffers,
      barbers: mappedBarbers.length > 0 ? mappedBarbers : fallback.barbers,
      branches: mappedBranches,
      gallery: mappedGallery,
      testimonials: mappedTestimonials,
      settings: mergeSettings(settingsRows),
    };
  } catch (error) {
    console.warn("[supabase] Failed to load data from Supabase:", error);
    return null;
  }
}

/**
 * بيقرأ كل محتوى الموقع من قاعدة البيانات (الحاجات المفعّلة بس).
 * يدعم Supabase أولاً ثم Postgres المباشر ثم المحتوى الثابت لو مفيش اتصال.
 */
export async function loadSiteContent(): Promise<SiteContent> {
  if (process.env.STATIC_EXPORT === "1") return staticContent();

  // (1) تجربة القراءة من Supabase
  if (isSupabaseConfigured) {
    const supabaseData = await loadFromSupabase();
    if (supabaseData) return supabaseData;
  }

  // (2) تجربة القراءة من اتصال PostgreSQL المباشر عبر Drizzle
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
      "[fallback] قاعدة البيانات غير متاحة — الموقع شغال بالبيانات الاحتياطية:",
      error
    );
    return staticContent();
  }
}
