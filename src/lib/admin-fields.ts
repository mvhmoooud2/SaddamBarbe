// تعريفات الحقول (ملف آمن للاستخدام في المتصفح — من غير أي كود سيرفر)

export type FieldType = "text" | "textarea" | "number" | "boolean" | "datetime";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** يظهر في الجدول المختصر */
  list?: boolean;
  hint?: string;
};

export type TableDef = {
  key: string;
  label: string;
  /** ممنوع الإضافة يدوياً (زي الحجوزات) */
  readonlyCreate?: boolean;
  fields: FieldDef[];
};

const active: FieldDef = {
  name: "isActive",
  label: "ظاهر في الموقع",
  type: "boolean",
  list: true,
};

export const adminTables: Record<string, TableDef> = {
  offers: {
    key: "offers",
    label: "العروض والخصومات",
    fields: [
      { name: "titleAr", label: "عنوان العرض (عربي)", type: "text", required: true, list: true },
      { name: "titleEn", label: "عنوان العرض (إنجليزي)", type: "text", required: true },
      { name: "descriptionAr", label: "وصف العرض (عربي)", type: "textarea" },
      { name: "descriptionEn", label: "وصف العرض (إنجليزي)", type: "textarea" },
      {
        name: "detailsAr",
        label: "تفاصيل العرض (عربي)",
        type: "textarea",
        hint: "كل سطر = نقطة في القائمة",
      },
      { name: "detailsEn", label: "تفاصيل العرض (إنجليزي)", type: "textarea" },
      { name: "oldPrice", label: "السعر قبل الخصم", type: "number", required: true, list: true },
      { name: "newPrice", label: "السعر بعد الخصم", type: "number", required: true, list: true },
      { name: "badgeAr", label: "لافتة (مثلاً: خصم 30%)", type: "text", list: true },
      { name: "imageUrl", label: "صورة العرض", type: "text", hint: "مثال: /images/offer-1.jpg" },
      { name: "validUntil", label: "العرض ساري حتى", type: "datetime" },
      active,
    ],
  },
  services: {
    key: "services",
    label: "الخدمات والأسعار",
    fields: [
      { name: "nameAr", label: "اسم الخدمة (عربي)", type: "text", required: true, list: true },
      { name: "nameEn", label: "اسم الخدمة (إنجليزي)", type: "text", required: true },
      { name: "descriptionAr", label: "الوصف (عربي)", type: "textarea" },
      { name: "descriptionEn", label: "الوصف (إنجليزي)", type: "textarea" },
      { name: "price", label: "السعر (جنيه)", type: "number", required: true, list: true },
      { name: "durationMinutes", label: "المدة (دقيقة)", type: "number", required: true, list: true },
      { name: "imageUrl", label: "الصورة", type: "text" },
      active,
    ],
  },
  barbers: {
    key: "barbers",
    label: "الحلاقين",
    fields: [
      { name: "nameAr", label: "الاسم (عربي)", type: "text", required: true, list: true },
      { name: "nameEn", label: "الاسم (إنجليزي)", type: "text", required: true },
      { name: "roleAr", label: "الوظيفة (عربي)", type: "text", required: true, list: true },
      { name: "roleEn", label: "الوظيفة (إنجليزي)", type: "text", required: true },
      { name: "bioAr", label: "نبذة (عربي)", type: "textarea" },
      { name: "bioEn", label: "نبذة (إنجليزي)", type: "textarea" },
      { name: "imageUrl", label: "الصورة", type: "text" },
      active,
    ],
  },
  testimonials: {
    key: "testimonials",
    label: "آراء العملاء",
    fields: [
      { name: "customerName", label: "اسم العميل", type: "text", required: true, list: true },
      { name: "commentAr", label: "الرأي (عربي)", type: "textarea", required: true, list: true },
      { name: "commentEn", label: "الرأي (إنجليزي)", type: "textarea" },
      { name: "rating", label: "التقييم (1-5)", type: "number", required: true, list: true },
      active,
    ],
  },
  appointments: {
    key: "appointments",
    label: "الحجوزات",
    readonlyCreate: true,
    fields: [
      { name: "customerName", label: "اسم العميل", type: "text", list: true },
      { name: "customerPhone", label: "الموبايل", type: "text", list: true },
      { name: "serviceId", label: "رقم الخدمة", type: "number", list: true },
      { name: "barberId", label: "رقم الحلاق", type: "number" },
      { name: "appointmentDate", label: "الميعاد", type: "datetime", list: true },
      { name: "notes", label: "ملاحظات", type: "textarea" },
      {
        name: "status",
        label: "الحالة",
        type: "text",
        list: true,
        hint: "pending / confirmed / done / cancelled",
      },
    ],
  },
};

/** تحويل قيم الفورم لأنواع الداتابيز الصح */
export function coerceValues(def: TableDef, input: Record<string, unknown>) {
  const values: Record<string, unknown> = {};

  for (const field of def.fields) {
    if (!(field.name in input)) continue;
    const raw = input[field.name];

    if (raw === "" || raw === null || raw === undefined) {
      values[field.name] = null;
      continue;
    }

    switch (field.type) {
      case "boolean":
        values[field.name] = raw === true || raw === "true" || raw === 1;
        break;
      case "number":
        // الأسعار decimal → بتتخزن كنص، والباقي أرقام صحيحة
        values[field.name] = ["price", "oldPrice", "newPrice"].includes(field.name)
          ? Number(raw).toFixed(2)
          : Number(raw);
        break;
      case "datetime":
        values[field.name] = new Date(String(raw));
        break;
      default:
        values[field.name] = String(raw);
    }
  }

  return values;
}
