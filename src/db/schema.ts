import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }).notNull(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  imageUrl: text("image_url"),
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
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
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

/** إعدادات عامة للموقع (مفتاح/قيمة) — تتعدّل من لوحة التحكم /admin */
export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value"),
  labelAr: varchar("label_ar", { length: 200 }),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
