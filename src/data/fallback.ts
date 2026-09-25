// بيانات احتياطية تُستخدم لو قاعدة البيانات مش متاحة
// (مثلاً لو البيئة اتمسحت ومحدّثّش PostgreSQL) — الموقع يفضل شغال بنفس المحتوى
import {
  servicesData,
  barbersData,
  testimonialsData,
  offersData,
} from "./seed-data";
import type { Service, Barber, Testimonial, Offer } from "@/db/schema";

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

export const fallbackServices = withIds(servicesData) as unknown as Service[];
export const fallbackBarbers = withIds(barbersData) as unknown as Barber[];
export const fallbackTestimonials =
  withIds(testimonialsData) as unknown as Testimonial[];
export const fallbackOffers = withIds(offersData) as unknown as Offer[];
