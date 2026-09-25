/** بيقرأ من الداتابيز، ولو فشل بيستخدم بيانات ثابتة علشان الموقع مايفصلش */
export async function queryOrFallback<T>(
  load: () => Promise<T[]>,
  fallback: T[],
  label: string
): Promise<T[]> {
  try {
    return await load();
  } catch (error) {
    console.warn(
      `[fallback] ${label}: قاعدة البيانات غير متاحة، يتم استخدام البيانات الثابتة`,
      error
    );
    return fallback;
  }
}
