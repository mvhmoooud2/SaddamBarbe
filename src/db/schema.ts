import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }).notNull(),
  /** الاسم المختصر اللي بيظهر في كارت الخدمة (لو فاضي بيستخدم nameAr) */
  displayNameAr: varchar("display_name_ar", { length: 200 }),
  /** قسم الخدمة في صفحة الخدمات (مثال: حلاقة وعناية) */
  categoryAr: varchar("category_ar", { length: 200 }),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  imageUrl: text("image_url"),
  /**
   * الفروع اللي الخدمة متاحة فيها — معرفات الفروع مفصولة بفاصلة.
   * لو فاضي: الخدمة متاحة في كل الفروع.
   */
  branchSlugs: text("branch_slugs").default("").notNull(),
  /** تظهر في قائمة خدمات الفرع على الصفحة الرئيسية */
  isFeatured: boolean("is_featured").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  titleAr: varchar("title_ar", { length: 200 }).notNull(),
  titleEn: varchar("title_en", { length: 200 }).notNull(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  // تفاصيل العرض المكتوبة، كل سطر يمثل نقطة في القائمة
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  oldPrice: decimal("old_price", { precision: 10, scale: 2 }).notNull(),
  newPrice: decimal("new_price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  badgeAr: varchar("badge_ar", { length: 100 }),
  validUntil: timestamp("valid_until", { mode: "date" }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const barbers = pgTable("barbers", {
  id: serial("id").primaryKey(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }).notNull(),
  roleAr: varchar("role_ar", { length: 200 }).notNull(),
  roleEn: varchar("role_en", { length: 200 }).notNull(),
  bioAr: text("bio_ar"),
  bioEn: text("bio_en"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  barberId: integer("barber_id").references(() => barbers.id),
  appointmentDate: timestamp("appointment_date", { mode: "date" }).notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  commentAr: text("comment_ar").notNull(),
  commentEn: text("comment_en"),
  rating: integer("rating").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/** فروع الصالون — كانت بيانات ثابتة وبقت في قاعدة البيانات علشان تتعدّل من لوحة التحكم */
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  /** معرف ثابت بالإنجليزي (بيستخدم في الروابط وفي ربط الخدمات بالفرع) */
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  listingNameAr: varchar("listing_name_ar", { length: 200 }),
  badgeAr: varchar("badge_ar", { length: 100 }),
  addressAr: text("address_ar").notNull(),
  landmarkAr: text("landmark_ar"),
  /** سطر تعريفي صغير جوه كارت الفرع */
  summaryAr: text("summary_ar"),
  phoneDisplay: varchar("phone_display", { length: 60 }).notNull(),
  phoneHref: varchar("phone_href", { length: 60 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 40 }).notNull(),
  hoursAr: varchar("hours_ar", { length: 200 }).notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  priceListImage: text("price_list_image"),
  googleRating: doublePrecision("google_rating"),
  googleReviews: integer("google_reviews"),
  mapsUrl: text("maps_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/** صور معرض الصالون */
export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  src: text("src").notNull(),
  alt: text("alt").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/** إعدادات ونصوص الموقع (مفتاح/قيمة) — الاسم، الأرقام، السوشيال، عناوين الأقسام */
export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").default("").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
export type Barber = typeof barbers.$inferSelect;
export type NewBarber = typeof barbers.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type BranchRow = typeof branches.$inferSelect;
export type NewBranchRow = typeof branches.$inferInsert;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type NewGalleryImage = typeof galleryImages.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
