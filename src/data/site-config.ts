/**
 * بيانات التواصل واللينكات بتاعة الصالون.
 * عدّل من هنا مرة واحدة، والتغيير هيمشي على الموقع كله (الفوتر + الحجز).
 *
 * ملاحظة: أرقام التليفون والواتساب والعنوان والمواعيد بتيجي تلقائياً من
 * «الفرع الأساسي» في src/data/branches.ts — فلو بيانات الفرع اتغيرت،
 * بتتغير هناك بس والموقع كله بيتحدّث وراها.
 */
import { primaryBranch } from "./branches";

export const siteConfig = {
  nameAr: "صالون صدام للحلاقة",
  nameEn: "SADDAM BARBER",

  /** الرقم زي ما بيظهر للزوار (رقم الفرع الأساسي) */
  phoneDisplay: primaryBranch.phoneDisplay,
  /** نفس الرقم بلينك اتصال مباشر */
  phoneHref: primaryBranch.phoneHref,

  /**
   * رقم الواتساب بالصيغة الدولية، من غير + ومن غير مسافات.
   * مثال: 201061402242
   * (لو الرقم اتغير، بيتغيّر في src/data/branches.ts مرة واحدة وبس)
   */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || primaryBranch.whatsapp,

  /** عنوان الفرع الأساسي */
  address: primaryBranch.addressAr,
  /** مواعيد الفرع الأساسي */
  hours: primaryBranch.hoursAr,

  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
} as const;

/** لينك واتساب على رقم معيّن مع رسالة جاهزة */
export function whatsappLinkTo(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** لينك واتساب (رقم الفرع الأساسي) مع رسالة جاهزة */
export function whatsappLink(message: string) {
  return whatsappLinkTo(siteConfig.whatsapp, message);
}
