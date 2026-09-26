/**
 * إعدادات ونصوص الموقع القابلة للتعديل من لوحة التحكم (/admin).
 *
 * كل مفتاح هنا له قيمة افتراضية، ولو الأدمن غيّرها بتتخزن في جدول
 * site_settings في قاعدة البيانات وبتحلّ محل القيمة الافتراضية.
 */
import { primaryBranch } from "./branches";

export type SettingType = "text" | "textarea" | "image" | "url" | "phone";

export type SettingField = {
  key: string;
  labelAr: string;
  type: SettingType;
  hintAr?: string;
};

export type SettingGroup = {
  id: string;
  titleAr: string;
  fields: SettingField[];
};

export const settingGroups: SettingGroup[] = [
  {
    id: "general",
    titleAr: "بيانات عامة",
    fields: [
      { key: "siteNameAr", labelAr: "اسم الصالون (عربي)", type: "text" },
      { key: "siteNameEn", labelAr: "اسم الصالون (إنجليزي)", type: "text" },
      { key: "logoImage", labelAr: "شعار الموقع", type: "image" },
      {
        key: "footerAbout",
        labelAr: "نبذة الفوتر",
        type: "textarea",
      },
    ],
  },
  {
    id: "contact",
    titleAr: "التواصل والسوشيال",
    fields: [
      { key: "phoneDisplay", labelAr: "رقم التليفون الظاهر", type: "text" },
      {
        key: "phoneHref",
        labelAr: "لينك الاتصال",
        type: "text",
        hintAr: "بالشكل ده: tel:+201061402242",
      },
      {
        key: "whatsapp",
        labelAr: "رقم الواتساب",
        type: "phone",
        hintAr: "بالصيغة الدولية من غير + ولا مسافات، مثال: 201061402242",
      },
      { key: "address", labelAr: "العنوان الرئيسي", type: "text" },
      { key: "hours", labelAr: "مواعيد العمل", type: "text" },
      { key: "instagram", labelAr: "لينك إنستجرام", type: "url" },
      { key: "facebook", labelAr: "لينك فيسبوك", type: "url" },
      { key: "tiktok", labelAr: "لينك تيك توك (اختياري)", type: "url" },
      {
        key: "whatsappMessage",
        labelAr: "رسالة الواتساب الجاهزة",
        type: "text",
      },
    ],
  },
  {
    id: "hero",
    titleAr: "الواجهة الرئيسية (Hero)",
    fields: [
      { key: "heroImage", labelAr: "صورة الخلفية", type: "image" },
      { key: "heroKicker", labelAr: "السطر الصغير فوق العنوان", type: "text" },
      { key: "heroTitle", labelAr: "العنوان الرئيسي", type: "text" },
      {
        key: "heroTitleHighlight",
        labelAr: "الجزء المميّز بالذهبي من العنوان",
        type: "text",
      },
      { key: "heroSubtitle", labelAr: "الجملة تحت العنوان", type: "text" },
      { key: "heroTagline", labelAr: "السطر المميّز الصغير", type: "text" },
      { key: "heroPrimaryCta", labelAr: "زر الحجز", type: "text" },
      { key: "heroSecondaryCta", labelAr: "زر الخدمات", type: "text" },
    ],
  },
  {
    id: "sections",
    titleAr: "عناوين الأقسام",
    fields: [
      { key: "servicesKicker", labelAr: "خدماتنا — السطر الصغير", type: "text" },
      { key: "servicesTitle", labelAr: "خدماتنا — العنوان", type: "text" },
      { key: "servicesSubtitle", labelAr: "خدماتنا — الوصف", type: "textarea" },
      { key: "offersKicker", labelAr: "العروض — السطر الصغير", type: "text" },
      { key: "offersTitle", labelAr: "العروض — العنوان", type: "text" },
      { key: "offersSubtitle", labelAr: "العروض — الوصف", type: "textarea" },
      { key: "galleryKicker", labelAr: "المعرض — السطر الصغير", type: "text" },
      { key: "galleryTitle", labelAr: "المعرض — العنوان", type: "text" },
      { key: "branchesKicker", labelAr: "الفروع — السطر الصغير", type: "text" },
      { key: "branchesTitle", labelAr: "الفروع — العنوان", type: "text" },
      { key: "branchesSubtitle", labelAr: "الفروع — الوصف", type: "textarea" },
      { key: "bookingKicker", labelAr: "الحجز — السطر الصغير", type: "text" },
      { key: "bookingTitle", labelAr: "الحجز — العنوان", type: "text" },
      { key: "bookingSubtitle", labelAr: "الحجز — الوصف", type: "textarea" },
      {
        key: "testimonialsKicker",
        labelAr: "آراء العملاء — السطر الصغير",
        type: "text",
      },
      {
        key: "testimonialsTitle",
        labelAr: "آراء العملاء — العنوان",
        type: "text",
      },
      {
        key: "testimonialsSubtitle",
        labelAr: "آراء العملاء — الوصف",
        type: "textarea",
      },
    ],
  },
];

export const defaultSettings: Record<string, string> = {
  siteNameAr: "صالون صدام للحلاقة",
  siteNameEn: "SADDAM BARBER",
  logoImage: "/images/IMG_6588.jpeg",
  footerAbout:
    "صالون صدام للحلاقة يقدم تجربة حلاقة فاخرة بأيدي محترفين. نحرص على كل تفصيل لنمنحك المظهر الأنيق الذي تستحقه.",

  phoneDisplay: primaryBranch.phoneDisplay,
  phoneHref: primaryBranch.phoneHref,
  whatsapp: primaryBranch.whatsapp,
  address: primaryBranch.addressAr,
  hours: primaryBranch.hoursAr,
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  tiktok: "",
  whatsappMessage: "السلام عليكم، عايز أحجز موعد في صالون صدام",

  heroImage: "/images/hero.jpg",
  heroKicker: "SADDAM BARBER",
  heroTitle: "SADDAM",
  heroTitleHighlight: "BARBER",
  heroSubtitle: "مش مجرد حلاقة… دي تجربة صدام",
  heroTagline: "VIP MEN EXPERIENCE",
  heroPrimaryCta: "احجز موعدك الآن",
  heroSecondaryCta: "اكتشف خدماتنا",

  servicesKicker: "اختار الفرع الأول",
  servicesTitle: "خدمات كل فرع بوضوح",
  servicesSubtitle:
    "مفيش قائمة واحدة ملخبطة: اختار فرعك وهتشوف الخدمات المتاحة فيه فقط، وبعدها احجز الخدمة على واتساب في ضغطة.",
  offersKicker: "عروض خاصة",
  offersTitle: "عروض العرسان وتجارب VIP",
  offersSubtitle:
    "كل عرض واضح بسعره القديم والجديد وخدماته بالتفصيل. العروض متاحة في فرع مدينة نصر – عباس العقاد، واحجزها مباشرة على واتساب.",
  galleryKicker: "من داخل الصالون",
  galleryTitle: "معرض الصور",
  branchesKicker: "فروعنا",
  branchesTitle: "أقرب فرع ليك مستنيك",
  branchesSubtitle:
    "فرعينا في القاهرة: حدائق القبة ومدينة نصر. اختار الفرع الأقرب لك، وشوف مكانه على الخريطة، وكلمنا مباشرة أو احجز على واتساب في ثواني.",
  bookingKicker: "احجز موعدك",
  bookingTitle: "حجز موعد سريع",
  bookingSubtitle: "اختر الخدمة والوقت المناسب لك، وسنقوم بالتواصل معك لتأكيد الحجز.",
  testimonialsKicker: "تقييمات حقيقية",
  testimonialsTitle: "شوف تقييماتنا على Google",
  testimonialsSubtitle:
    "بدل ما نعرض كلام منسوب لعملاء من غير مصدر، تقدر تشوف التقييمات الحقيقية وتفاصيل كل فرع مباشرة على خرائط Google.",
};

export type SiteSettingsMap = Record<string, string>;

/** بيدمج القيم المحفوظة في قاعدة البيانات فوق القيم الافتراضية */
export function mergeSettings(
  rows: { key: string; value: string }[] = []
): SiteSettingsMap {
  const merged: SiteSettingsMap = { ...defaultSettings };
  for (const row of rows) {
    if (row.value !== null && row.value !== undefined && row.value !== "") {
      merged[row.key] = row.value;
    } else if (row.key in merged && row.value === "") {
      merged[row.key] = "";
    }
  }
  return merged;
}

export const settingKeys = settingGroups.flatMap((group) =>
  group.fields.map((field) => field.key)
);
