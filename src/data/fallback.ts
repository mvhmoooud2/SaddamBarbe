// بيانات احتياطية تُستخدم لو قاعدة البيانات مش متاحة
// (مثلاً لو البيئة اتمسحت ومحدّثّش PostgreSQL) — الموقع يفضل شغال بنفس المحتوى
import { servicesData, barbersData, offersData } from "./seed-data";
import { enrichServices } from "./service-enrich";
import { galleryData } from "./gallery";
import type { Service, Barber, Offer, Testimonial } from "@/db/schema";

/** يضيف id وتاريخ إنشاء للصفوف الاحتياطية علشان تطابق شكل صفوف الداتابيز */
function withIds<T extends object>(rows: T[]): (T & {
  id: number;
  createdAt: Date;
})[] {
  return rows.map((row, index) => ({
    ...row,
    id: index + 1,
    createdAt: new Date(),
  }));
}

export const fallbackServices = withIds(
  enrichServices(servicesData).map((row) => ({
    displayNameAr: null,
    categoryAr: null,
    branchSlugs: "",
    isFeatured: true,
    sortOrder: 0,
    ...row,
  }))
) as unknown as Service[];

export const fallbackBarbers = withIds(
  barbersData.map((row) => ({ sortOrder: 0, ...row }))
) as unknown as Barber[];

export const fallbackOffers = withIds(
  offersData.map((row) => ({ sortOrder: 0, ...row }))
) as unknown as Offer[];

export const fallbackTestimonials: Testimonial[] = [];

export const fallbackGallery = galleryData;
