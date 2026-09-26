// ربط تعريفات الحقول (admin-fields.ts) بجداول الداتابيز — ملف سيرفر فقط
import type { PgTable } from "drizzle-orm/pg-core";
import {
  appointments,
  barbers,
  offers,
  services,
  testimonials,
} from "@/db/schema";
import { adminTables as fieldDefs, coerceValues } from "@/lib/admin-fields";
import type { FieldDef, TableDef as FieldTableDef } from "@/lib/admin-fields";

export type { FieldDef };
export { coerceValues };

export type TableDef = FieldTableDef & { table: PgTable };

const drizzleTables: Record<string, PgTable> = {
  offers,
  services,
  barbers,
  testimonials,
  appointments,
};

export const adminTables: Record<string, TableDef> = Object.fromEntries(
  Object.entries(fieldDefs).map(([key, def]) => [
    key,
    { ...def, table: drizzleTables[key] },
  ])
);
