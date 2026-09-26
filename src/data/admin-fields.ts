/**
 * تعريف الحقول القابلة للتعديل في لوحة التحكم.
 * الملف ده بيانات خالصة (بدون أي كود سيرفر) علشان الواجهة والـ API
 * يستخدموا نفس التعريف — أي حقل تضيفه هنا بيظهر في الفورم تلقائياً.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "price"
  | "boolean"
  | "image"
  | "datetime"
  | "select"
  | "branches";

export type AdminField = {
  name: string;
  labelAr: string;
  type: FieldType;
  required?: boolean;
  hintAr?: string;
  options?: { value: string; labelAr: string }[];
  /** للعرض فقط (مايتبعتش في التعديل) */
  readOnly?: boolean;
};

export type AdminResource = {
  key: string;
  titleAr: string;
  singularAr: string;
  /** الحقول اللي بتظهر في جدول القائمة */
  listFields: string[];
  fields: AdminField[];
  canCreate?: boolean;
  canDelete?: boolean;
};

const activeField: AdminField = {
  name: "isActive",
  labelAr: "ظاهر في الموقع",
  type: "boolean",
};
const sortField: AdminField = {
  name: "sortOrder",
  labelAr: "الترتيب",
  type: "number",
  hintAr: "الأصغر بيظهر الأول",
};

export const adminResources: AdminResource[] = [
  {
    key: "services",
    titleAr: "الخدمات",
    singularAr: "خدمة",
    listFields: ["nameAr", "categoryAr", "price", "isFeatured", "isActive"],
    fields: [
      { name: "nameAr", labelAr: "اسم الخدمة (عربي)", type: "text", required: true },
      { name: "nameEn", labelAr: "اسم الخدمة (إنجليزي)", type: "text", required: true },
      {
        name: "displayNameAr",
        labelAr: "الاسم المختصر في الكارت",
        type: "text",
        hintAr: "لو فاضي هيستخدم الاسم العربي",
      },
      { name: "categoryAr", labelAr: "القسم", type: "text", hintAr: "مثال: حلاقة وعناية" },
      { name: "descriptionAr", labelAr: "الوصف (عربي)", type: "textarea" },
      { name: "descriptionEn", labelAr: "الوصف (إنجليزي)", type: "textarea" },
      { name: "price", labelAr: "السعر (جنيه)", type: "price", required: true },
      { name: "durationMinutes", labelAr: "المدة (دقيقة)", type: "number", required: true },
      { name: "imageUrl", labelAr: "صورة الخدمة", type: "image" },
      {
        name: "branchSlugs",
        labelAr: "الفروع المتاحة فيها",
        type: "branches",
        hintAr: "من غير اختيار = متاحة في كل الفروع",
      },
      {
        name: "isFeatured",
        labelAr: "تظهر في قائمة خدمات الفرع",
        type: "boolean",
      },
      sortField,
      activeField,
    ],
  },
  {
    key: "offers",
    titleAr: "العروض",
    singularAr: "عرض",
    listFields: ["titleAr", "oldPrice", "newPrice", "badgeAr", "isActive"],
    fields: [
      { name: "titleAr", labelAr: "عنوان العرض (عربي)", type: "text", required: true },
      { name: "titleEn", labelAr: "عنوان العرض (إنجليزي)", type: "text", required: true },
      { name: "descriptionAr", labelAr: "الوصف (عربي)", type: "textarea" },
      { name: "descriptionEn", labelAr: "الوصف (إنجليزي)", type: "textarea" },
      {
        name: "detailsAr",
        labelAr: "تفاصيل العرض",
        type: "textarea",
        hintAr: "كل سطر بيظهر كنقطة في القائمة",
      },
      { name: "oldPrice", labelAr: "السعر قبل الخصم", type: "price", required: true },
      { name: "newPrice", labelAr: "السعر بعد الخصم", type: "price", required: true },
      { name: "badgeAr", labelAr: "الشارة (مثال: الأكثر طلباً)", type: "text" },
      { name: "imageUrl", labelAr: "صورة العرض", type: "image" },
      { name: "validUntil", labelAr: "ساري حتى", type: "datetime" },
      sortField,
      activeField,
    ],
  },
  {
    key: "branches",
    titleAr: "الفروع",
    singularAr: "فرع",
    listFields: ["nameAr", "phoneDisplay", "hoursAr", "isActive"],
    fields: [
      {
        name: "slug",
        labelAr: "المعرف (إنجليزي)",
        type: "text",
        required: true,
        hintAr: "حروف إنجليزي وشرطات، مثال: nasr-city",
      },
      { name: "nameAr", labelAr: "اسم الفرع", type: "text", required: true },
      { name: "listingNameAr", labelAr: "الاسم على خرائط جوجل", type: "text" },
      { name: "badgeAr", labelAr: "شارة الفرع", type: "text" },
      { name: "addressAr", labelAr: "العنوان", type: "textarea", required: true },
      { name: "landmarkAr", labelAr: "علامة مميزة / Plus Code", type: "text" },
      { name: "summaryAr", labelAr: "سطر تعريفي داخل الكارت", type: "textarea" },
      { name: "phoneDisplay", labelAr: "رقم التليفون الظاهر", type: "text", required: true },
      {
        name: "phoneHref",
        labelAr: "لينك الاتصال",
        type: "text",
        required: true,
        hintAr: "tel:+201061402242",
      },
      {
        name: "whatsapp",
        labelAr: "رقم الواتساب",
        type: "text",
        required: true,
        hintAr: "201061402242",
      },
      { name: "hoursAr", labelAr: "مواعيد العمل", type: "text", required: true },
      { name: "lat", labelAr: "خط العرض (lat)", type: "number" },
      { name: "lng", labelAr: "خط الطول (lng)", type: "number" },
      { name: "priceListImage", labelAr: "صورة قائمة الأسعار", type: "image" },
      { name: "googleRating", labelAr: "تقييم جوجل", type: "number" },
      { name: "googleReviews", labelAr: "عدد تقييمات جوجل", type: "number" },
      { name: "mapsUrl", labelAr: "لينك جوجل مابس", type: "text" },
      sortField,
      activeField,
    ],
  },
  {
    key: "gallery",
    titleAr: "معرض الصور",
    singularAr: "صورة",
    listFields: ["src", "alt", "isActive"],
    fields: [
      { name: "src", labelAr: "الصورة", type: "image", required: true },
      { name: "alt", labelAr: "وصف الصورة", type: "text", required: true },
      sortField,
      activeField,
    ],
  },
  {
    key: "barbers",
    titleAr: "الفريق",
    singularAr: "حلاق",
    listFields: ["nameAr", "roleAr", "isActive"],
    fields: [
      { name: "nameAr", labelAr: "الاسم (عربي)", type: "text", required: true },
      { name: "nameEn", labelAr: "الاسم (إنجليزي)", type: "text", required: true },
      { name: "roleAr", labelAr: "الوظيفة (عربي)", type: "text", required: true },
      { name: "roleEn", labelAr: "الوظيفة (إنجليزي)", type: "text", required: true },
      { name: "bioAr", labelAr: "نبذة (عربي)", type: "textarea" },
      { name: "bioEn", labelAr: "نبذة (إنجليزي)", type: "textarea" },
      { name: "imageUrl", labelAr: "الصورة", type: "image" },
      sortField,
      activeField,
    ],
  },
  {
    key: "testimonials",
    titleAr: "آراء العملاء",
    singularAr: "رأي",
    listFields: ["customerName", "rating", "commentAr", "isActive"],
    fields: [
      { name: "customerName", labelAr: "اسم العميل", type: "text", required: true },
      { name: "commentAr", labelAr: "التعليق", type: "textarea", required: true },
      { name: "commentEn", labelAr: "التعليق (إنجليزي)", type: "textarea" },
      {
        name: "rating",
        labelAr: "التقييم",
        type: "select",
        required: true,
        options: [
          { value: "5", labelAr: "5 نجوم" },
          { value: "4", labelAr: "4 نجوم" },
          { value: "3", labelAr: "3 نجوم" },
          { value: "2", labelAr: "نجمتان" },
          { value: "1", labelAr: "نجمة" },
        ],
      },
      sortField,
      activeField,
    ],
  },
  {
    key: "appointments",
    titleAr: "الحجوزات",
    singularAr: "حجز",
    canCreate: false,
    listFields: [
      "customerName",
      "customerPhone",
      "appointmentDate",
      "status",
      "notes",
    ],
    fields: [
      { name: "customerName", labelAr: "اسم العميل", type: "text", required: true },
      { name: "customerPhone", labelAr: "رقم الموبايل", type: "text", required: true },
      { name: "serviceName", labelAr: "الخدمة المطلوبة", type: "text" },
      { name: "branchSlug", labelAr: "الفرع", type: "text" },
      { name: "appointmentDate", labelAr: "ميعاد الحجز", type: "datetime", required: true },
      {
        name: "status",
        labelAr: "الحالة",
        type: "select",
        required: true,
        options: [
          { value: "pending", labelAr: "في الانتظار" },
          { value: "confirmed", labelAr: "مؤكد" },
          { value: "completed", labelAr: "تم" },
          { value: "cancelled", labelAr: "ملغي" },
        ],
      },
      { name: "notes", labelAr: "ملاحظات وتفاصيل الحجز", type: "textarea" },
    ],
  },
];

export function getResource(key: string) {
  return adminResources.find((resource) => resource.key === key);
}
