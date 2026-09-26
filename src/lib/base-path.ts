// مسار نشر الموقع.
//
// GitHub Pages بيخدم المستودع على /<اسم-المستودع> مش على الجذر،
// واسم المستودع هنا SaddamBarber، فالمسار الصح هو "/SaddamBarber".
//
// القيمة بتيجي من NEXT_PUBLIC_BASE_PATH (نفس المتغير اللي next.config.ts
// بيقرأ منه) علشان يبقى فيه مصدر واحد للحقيقة ومفيش تعارض بين
// مسار الصفحات ومسار ملفات CSS/JS/الصور.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * بيضيف مسار النشر لملفات مجلد public (الصور والأيقونات).
 * في التطوير بيرجّع المسار زي ما هو، وعلى GitHub Pages بيضيف /SaddamBarber في الأول.
 * لو الرابط خارجي (Supabase Storage أو http/https أو Data URL) بيرجعه زي ما هو مباشرة.
 */
export function asset(path: string | undefined | null) {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("//")
  ) {
    return path;
  }
  return `${basePath}${path}`;
}
