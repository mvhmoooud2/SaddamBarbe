/**
 * بيانات فروع الصالون — مصدر واحد للحقيقة.
 *
 * أي تعديل على عنوان أو رقم أو ميعاد بيتعمل هنا مرة واحدة بس،
 * وبيظهر تلقائياً في قسم «فروعنا» (الخريطة + الأزرار + اللينكات).
 *
 * ⚠️ القيم اللي تحت حالياً placeholder (نفس البيانات التجريبية الموجودة
 *    في site-config) — لازم تتستبدل بالبيانات الحقيقية للفرعين قبل النشر.
 */

export type Branch = {
  /** معرف ثابت للفرع (بالإنجليزي، من غير مسافات) */
  id: string;
  /** اسم الفرع زي ما بيظهر للزائر، مثال: "فرع المعادي" */
  nameAr: string;
  /** شارة اختيارية جنب الاسم، مثال: "الفرع الرئيسي" */
  badgeAr?: string;
  /** العنوان الكامل بالعربي */
  addressAr: string;
  /** علامة مميزة تساعد الزائر يلاقي الفرع (اختياري) */
  landmarkAr?: string;
  /** رقم التليفون زي ما بيظهر للزائر */
  phoneDisplay: string;
  /** نفس الرقم بلينك اتصال مباشر، مثال: "tel:+201001234567" */
  phoneHref: string;
  /** رقم واتساب الفرع بالصيغة الدولية من غير + ولا مسافات، مثال: "201001234567" */
  whatsapp?: string;
  /** مواعيد العمل، مثال: "يومياً من 10:00 صباحاً حتى 12:00 منتصف الليل" */
  hoursAr: string;
  /** إحداثيات الفرع — بتتحط في مركز الخريطة وفي لينك الاتجاهات */
  lat?: number;
  lng?: number;
  /** نص البحث في خرائط جوجل (لو الإحداثيات مش متاحة، بيستخدم العنوان) */
  mapQuery?: string;
};

export const branches: Branch[] = [
  {
    // TODO: بيانات الفرع الأول الحقيقية
    id: "branch-1",
    nameAr: "الفرع الرئيسي",
    badgeAr: "الفرع الرئيسي",
    addressAr: "شارع التحرير، القاهرة، مصر",
    phoneDisplay: "+20 123 456 7890",
    phoneHref: "tel:+201234567890",
    whatsapp: "201234567890",
    hoursAr: "يومياً من 10:00 صباحاً حتى 10:00 مساءً",
    lat: 30.0444,
    lng: 31.2357,
  },
  {
    // TODO: بيانات الفرع التاني الحقيقية
    id: "branch-2",
    nameAr: "الفرع التاني",
    addressAr: "شارع التحرير، القاهرة، مصر",
    phoneDisplay: "+20 123 456 7890",
    phoneHref: "tel:+201234567890",
    whatsapp: "201234567890",
    hoursAr: "يومياً من 10:00 صباحاً حتى 10:00 مساءً",
    lat: 30.0444,
    lng: 31.2357,
  },
];

/**
 * نص البحث اللي الخريطة بتدور عليه:
 * الإحداثيات أولاً (أدق)، وبعدين نص حر، وأخيراً العنوان.
 */
function mapTarget(branch: Branch) {
  if (typeof branch.lat === "number" && typeof branch.lng === "number") {
    return `${branch.lat},${branch.lng}`;
  }
  return branch.mapQuery || `${branch.addressAr} ${branch.nameAr}`;
}

/**
 * لينك خريطة جوجل المدمجة (iframe) — من غير أي API key.
 * hl=ar علشان واجهة الخريطة تبقى عربي.
 */
export function mapEmbedUrl(branch: Branch) {
  const query = encodeURIComponent(mapTarget(branch));
  return `https://www.google.com/maps?q=${query}&z=16&hl=ar&output=embed`;
}

/** لينك «الاتجاهات» في تطبيق/موقع خرائط جوجل */
export function directionsUrl(branch: Branch) {
  const destination = encodeURIComponent(mapTarget(branch));
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

/** لينك واتساب الفرع برسالة جاهزة فيها اسم الفرع */
export function branchWhatsappLink(branch: Branch, salonName: string) {
  const number = branch.whatsapp || branch.phoneHref.replace(/^tel:\+?/, "");
  const message = `السلام عليكم، عايز أحجز موعد في ${salonName} — ${branch.nameAr}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
