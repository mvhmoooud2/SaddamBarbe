// مسار نشر الموقع.
//
// GitHub Pages بيخدم المستودع على /<اسم-المستودع> مش على الجذر،
// واسم المستودع هنا SaddamBarbe، فالمسار الصح هو "/SaddamBarbe".
//
// القيمة بتيجي من NEXT_PUBLIC_BASE_PATH (نفس المتغير اللي next.config.ts
// بيقرأ منه) علشان يبقى فيه مصدر واحد للحقيقة ومفيش تعارض بين
// مسار الصفحات ومسار ملفات CSS/JS/الصور.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * بيضيف مسار النشر لملفات مجلد public (الصور والأيقونات).
 * في التطوير بيرجّع المسار زي ما هو، وعلى GitHub Pages بيضيف /SaddamBarbe في الأول.
 */
export function asset(path: string) {
  return `${basePath}${path}`;
}
