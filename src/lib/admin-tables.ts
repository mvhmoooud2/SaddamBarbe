import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  services,
  offers,
  barbers,
  branches,
  galleryImages,
  testimonials,
  appointments,
} from "@/db/schema";
import { getResource, type AdminField } from "@/data/admin-fields";
import { createClientServer } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { isSupabaseConfigured } from "./supabase/config";
import {
  fallbackServices,
  fallbackOffers,
  fallbackBarbers,
  fallbackGallery,
} from "@/data/fallback";
import { branches as staticBranches } from "@/data/branches";

// جداول Drizzle
type AnyValue = any;

type TableConfig = {
  table: AnyValue;
  supabaseTable: string;
  orderBy: AnyValue[];
};

const tables: Record<string, TableConfig> = {
  services: {
    table: services,
    supabaseTable: "services",
    orderBy: [asc(services.sortOrder), asc(services.id)],
  },
  offers: {
    table: offers,
    supabaseTable: "offers",
    orderBy: [asc(offers.sortOrder), asc(offers.id)],
  },
  barbers: {
    table: barbers,
    supabaseTable: "barbers",
    orderBy: [asc(barbers.sortOrder), asc(barbers.id)],
  },
  branches: {
    table: branches,
    supabaseTable: "branches",
    orderBy: [asc(branches.sortOrder), asc(branches.id)],
  },
  gallery: {
    table: galleryImages,
    supabaseTable: "gallery_images",
    orderBy: [asc(galleryImages.sortOrder), asc(galleryImages.id)],
  },
  testimonials: {
    table: testimonials,
    supabaseTable: "testimonials",
    orderBy: [asc(testimonials.sortOrder), asc(testimonials.id)],
  },
  appointments: {
    table: appointments,
    supabaseTable: "appointments",
    orderBy: [desc(appointments.appointmentDate)],
  },
};

export function getTable(resourceKey: string) {
  return tables[resourceKey];
}

/**
 * بيطلّع السبب الحقيقي للخطأ من جوه أخطاء Drizzle/pg.
 *
 * Drizzle بيلفّ خطأ الداتابيز الأصلي في رسالة عامة زي:
 *   "Failed query: update ... params: ..."
 * والسبب الفعلي (زي: column "x" does not exist) بيبقى جوه error.cause.
 * الدالة دي بتفكّ السلسلة وترجّع أعمق رسالة مفيدة.
 */
export function describeDbError(error: unknown): string {
  const messages: string[] = [];
  let current: any = error;
  const seen = new Set<unknown>();
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const detail = current.detail || current.hint;
    const message = current.message;
    if (message && !String(message).startsWith("Failed query")) {
      messages.push(String(message));
    }
    if (detail) messages.push(String(detail));
    current = current.cause;
  }
  // أعمق رسالة (سبب pg الحقيقي) هي الأهم
  return messages.length ? messages[messages.length - 1] : "خطأ غير معروف في قاعدة البيانات";
}

/** تحويل المفاتيح من camelCase إلى snake_case */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/** تحويل المفاتيح من snake_case إلى camelCase */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

export function objectToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value;
  }
  return result;
}

export function objectToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value;
  }
  return result;
}

function getFallbackData(resourceKey: string): Record<string, unknown>[] {
  switch (resourceKey) {
    case "services":
      return fallbackServices.map((s: any, index) => ({
        ...s,
        id: s.id ?? index + 1,
        sortOrder: s.sortOrder ?? (index + 1) * 10,
        isActive: s.isActive ?? true,
      }));
    case "offers":
      return fallbackOffers.map((o: any, index) => ({
        ...o,
        id: o.id ?? index + 1,
        sortOrder: o.sortOrder ?? (index + 1) * 10,
        isActive: o.isActive ?? true,
      }));
    case "barbers":
      return fallbackBarbers.map((b: any, index) => ({
        ...b,
        id: b.id ?? index + 1,
        sortOrder: b.sortOrder ?? (index + 1) * 10,
        isActive: b.isActive ?? true,
      }));
    case "branches":
      return staticBranches.map((br, index) => ({
        id: index + 1,
        slug: br.id,
        nameAr: br.nameAr,
        listingNameAr: br.listingNameAr || null,
        badgeAr: br.badgeAr || null,
        addressAr: br.addressAr,
        landmarkAr: br.landmarkAr || null,
        summaryAr: br.summaryAr || null,
        phoneDisplay: br.phoneDisplay,
        phoneHref: br.phoneHref,
        whatsapp: br.whatsapp,
        hoursAr: br.hoursAr,
        lat: br.lat || null,
        lng: br.lng || null,
        priceListImage: br.priceListImage || null,
        googleRating: br.googleRating || null,
        googleReviews: br.googleReviews || null,
        mapsUrl: br.mapsUrl || null,
        sortOrder: (index + 1) * 10,
        isActive: true,
      }));
    case "gallery":
      return fallbackGallery.map((g, index) => ({
        id: index + 1,
        src: g.src,
        alt: g.alt,
        sortOrder: (index + 1) * 10,
        isActive: true,
      }));
    default:
      return [];
  }
}

/** جلب صفوف المورد من Supabase أو Drizzle مع Fallback */
export async function listRows(resourceKey: string): Promise<Record<string, unknown>[]> {
  const config = tables[resourceKey];
  if (!config) return [];

  // (1) من Supabase
  if (isSupabaseConfigured) {
    try {
      const supabase = (await createClientServer()) || createAdminClient();
      if (supabase) {
        let query = supabase.from(config.supabaseTable).select("*");

        if (resourceKey === "appointments") {
          query = query.order("appointment_date", { ascending: false });
        } else {
          query = query
            .order("sort_order", { ascending: true })
            .order("id", { ascending: true });
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((row) => objectToCamel(row as Record<string, unknown>));
        }
      }
    } catch (e) {
      console.warn(`[admin-tables] Supabase fetch error for ${resourceKey}:`, e);
    }
  }

  // (2) من Drizzle / Postgres المباشر
  try {
    const rows = await db.select().from(config.table).orderBy(...config.orderBy);
    if (rows && rows.length > 0) {
      return rows as Record<string, unknown>[];
    }
  } catch (e) {
    console.warn(`[admin-tables] Drizzle fetch error for ${resourceKey}:`, e);
  }

  // (3) Fallback للبيانات الافتراضية
  return getFallbackData(resourceKey);
}

/** إنشاء صف جديد في Supabase أو Drizzle */
export async function createRow(
  resourceKey: string,
  values: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const config = tables[resourceKey];
  if (!config) throw new Error("مورد غير معروف");

  // (1) في Supabase
  if (isSupabaseConfigured) {
    try {
      const supabase = (await createClientServer()) || createAdminClient();
      if (supabase) {
        const snakeValues = objectToSnake(values);

        // تنظيف القيم
        delete snakeValues.id;
        delete snakeValues.created_at;
        delete snakeValues.updated_at;

        const { data, error } = await (supabase as any)
          .from(config.supabaseTable)
          .insert(snakeValues)
          .select()
          .single();

        if (error) {
          console.error(`[admin-tables] Supabase insert error:`, error);
          throw new Error(error.message);
        }
        return objectToCamel(data as Record<string, unknown>);
      }
    } catch (e: any) {
      if (e?.message) throw e;
    }
  }

  // (2) في Drizzle / Postgres
  const rows = (await db
    .insert(config.table)
    .values(values)
    .returning()) as Record<string, unknown>[];
  return rows[0];
}

/** تعديل صف في Supabase أو Drizzle */
export async function updateRow(
  resourceKey: string,
  id: number | string,
  values: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const config = tables[resourceKey];
  if (!config) throw new Error("مورد غير معروف");

  const numericId = Number(id);

  // (1) في Supabase
  if (isSupabaseConfigured) {
    try {
      const supabase = (await createClientServer()) || createAdminClient();
      if (supabase) {
        const snakeValues = objectToSnake(values);
        delete snakeValues.id;
        delete snakeValues.created_at;
        delete snakeValues.updated_at;

        const { data, error } = await (supabase as any)
          .from(config.supabaseTable)
          .update(snakeValues)
          .eq("id", numericId)
          .select()
          .single();

        if (error) {
          console.error(`[admin-tables] Supabase update error:`, error);
          throw new Error(error.message);
        }
        return objectToCamel(data as Record<string, unknown>);
      }
    } catch (e: any) {
      if (e?.message) throw e;
    }
  }

  // (2) في Drizzle
  const rows = (await db
    .update(config.table)
    .set(values)
    .where(eq(config.table.id, numericId))
    .returning()) as Record<string, unknown>[];
  return rows[0];
}

/** حذف صف في Supabase أو Drizzle */
export async function deleteRow(
  resourceKey: string,
  id: number | string
): Promise<boolean> {
  const config = tables[resourceKey];
  if (!config) throw new Error("مورد غير معروف");

  const numericId = Number(id);

  // (1) في Supabase
  if (isSupabaseConfigured) {
    try {
      const supabase = (await createClientServer()) || createAdminClient();
      if (supabase) {
        const { error } = await supabase
          .from(config.supabaseTable)
          .delete()
          .eq("id", numericId);

        if (error) {
          console.error(`[admin-tables] Supabase delete error:`, error);
          throw new Error(error.message);
        }
        return true;
      }
    } catch (e: any) {
      if (e?.message) throw e;
    }
  }

  // (2) في Drizzle
  await db.delete(config.table).where(eq(config.table.id, numericId));
  return true;
}

function coerce(field: AdminField, raw: unknown) {
  if (raw === undefined) return undefined;

  switch (field.type) {
    case "boolean":
      return raw === true || raw === "true" || raw === 1 || raw === "1";
    case "number": {
      if (raw === "" || raw === null) return null;
      const value = Number(raw);
      return Number.isFinite(value) ? value : null;
    }
    case "price": {
      if (raw === "" || raw === null) return null;
      const value = Number(raw);
      return Number.isFinite(value) ? value.toFixed(2) : null;
    }
    case "datetime": {
      if (!raw) return null;
      const date = new Date(String(raw));
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }
    case "select": {
      if (raw === "" || raw === null) return null;
      const numeric = Number(raw);
      return field.name === "rating" && Number.isFinite(numeric)
        ? numeric
        : String(raw);
    }
    default: {
      if (raw === null) return null;
      const value = String(raw).trim();
      return value === "" ? (field.required ? value : null) : value;
    }
  }
}

/** بيحوّل بيانات الفورم لقيم جاهزة للحفظ حسب تعريف الحقول */
export function sanitizeBody(
  resourceKey: string,
  body: Record<string, unknown>,
  { partial }: { partial: boolean }
) {
  const resource = getResource(resourceKey);
  if (!resource) throw new Error("مورد غير معروف");

  const values: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const field of resource.fields) {
    if (field.readOnly) continue;
    const raw = body[field.name];
    if (partial && raw === undefined) continue;

    let value = coerce(field, raw);

    // الحقول المنطقية لازم تبقى true/false دايماً
    if (field.type === "boolean") {
      value =
        raw === undefined || raw === null
          ? field.name === "isActive" || field.name === "isFeatured"
          : Boolean(value);
    }

    if (field.required && (value === null || value === undefined || value === "")) {
      errors.push(`«${field.labelAr}» مطلوب`);
      continue;
    }

    values[field.name] = value === undefined ? null : value;
  }

  // قيم افتراضية عند الإنشاء
  if (!partial) {
    if (values.sortOrder === null || values.sortOrder === undefined) {
      values.sortOrder = 0;
    }
    if (values.isActive === undefined || values.isActive === null) {
      values.isActive = true;
    }
    if (values.isFeatured === undefined || values.isFeatured === null) {
      values.isFeatured = true;
    }
    if (resourceKey === "services" && values.branchSlugs == null) {
      values.branchSlugs = "";
    }
  }
  if (resourceKey === "services" && values.branchSlugs === null) {
    values.branchSlugs = "";
  }

  return { values, errors };
}
