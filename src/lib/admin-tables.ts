import { asc } from "drizzle-orm";
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

// جداول Drizzle أنواعها مختلفة، فبنتعامل معاها بشكل عام هنا
type AnyValue = any;

type TableConfig = {
  table: AnyValue;
  orderBy: AnyValue[];
};

const tables: Record<string, TableConfig> = {
  services: { table: services, orderBy: [asc(services.sortOrder), asc(services.id)] },
  offers: { table: offers, orderBy: [asc(offers.sortOrder), asc(offers.id)] },
  barbers: { table: barbers, orderBy: [asc(barbers.sortOrder), asc(barbers.id)] },
  branches: { table: branches, orderBy: [asc(branches.sortOrder), asc(branches.id)] },
  gallery: {
    table: galleryImages,
    orderBy: [asc(galleryImages.sortOrder), asc(galleryImages.id)],
  },
  testimonials: {
    table: testimonials,
    orderBy: [asc(testimonials.sortOrder), asc(testimonials.id)],
  },
  appointments: {
    table: appointments,
    orderBy: [asc(appointments.appointmentDate)],
  },
};

export function getTable(resourceKey: string) {
  return tables[resourceKey];
}

export async function listRows(resourceKey: string) {
  const config = tables[resourceKey];
  if (!config) return [];
  return db.select().from(config.table).orderBy(...config.orderBy);
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
      return Number.isNaN(date.getTime()) ? null : date;
    }
    case "select": {
      if (raw === "" || raw === null) return null;
      // التقييم رقم، والحالة نص
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

    // الحقول المنطقية لازم تبقى true/false دايماً (الأعمدة مش بتقبل null)
    if (field.type === "boolean") {
      value =
        raw === undefined || raw === null
          ? field.name === "isActive"
          : Boolean(value);
    }

    if (field.required && (value === null || value === undefined || value === "")) {
      errors.push(`«${field.labelAr}» مطلوب`);
      continue;
    }

    // الحقول النصية غير المطلوبة تبقى null لو فاضية
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
    if (values.sortOrder === null) values.sortOrder = 0;
    if (resourceKey === "services" && values.branchSlugs == null) {
      values.branchSlugs = "";
    }
  }
  if (resourceKey === "services" && values.branchSlugs === null) {
    values.branchSlugs = "";
  }

  return { values, errors };
}
