import type { Service } from "@/db/schema";

export type BranchServiceOption = Service & {
  displayNameAr: string;
  categoryAr: string;
};

/** بيحوّل نص الفروع المخزّن (مفصول بفاصلة) لقائمة معرفات */
export function parseBranchSlugs(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

/** هل الخدمة دي متاحة في الفرع ده؟ (فاضي = متاحة في كل الفروع) */
export function serviceInBranch(service: Service, branchId: string) {
  const slugs = parseBranchSlugs(service.branchSlugs);
  return slugs.length === 0 || slugs.includes(branchId);
}

/**
 * خدمات الفرع المختار كما تظهر للعميل.
 *
 * كل البيانات (الاسم المختصر، القسم، الفروع، الترتيب) بقت متخزنة مع الخدمة
 * نفسها في قاعدة البيانات، فتقدر تعدّلها كلها من لوحة التحكم (/admin)
 * من غير ما تلمس الكود.
 */
export function getBranchServiceOptions(
  branchId: string,
  services: Service[]
): BranchServiceOption[] {
  return services
    .filter(
      (service) =>
        service.isActive !== false &&
        service.isFeatured !== false &&
        serviceInBranch(service, branchId)
    )
    .slice()
    .sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id
    )
    .map((service) => ({
      ...service,
      displayNameAr: service.displayNameAr?.trim() || service.nameAr,
      categoryAr: service.categoryAr?.trim() || "خدمات",
    }));
}

/** الفروع اللي فيها خدمات سبا إضافية (بتتحدد من خدمات الفرع نفسه) */
export function branchHasExtraSpa(branchId: string, services: Service[] = []) {
  return services.some(
    (service) =>
      serviceInBranch(service, branchId) &&
      /ساونا|جاكوزي|استيم|حمام مغربي|مساج/.test(service.nameAr)
  );
}
