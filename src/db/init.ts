import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index";
import { services } from "./schema";
import { seedDatabase } from "./seed";

/**
 * تجهيز قاعدة البيانات عند النشر (بيتنفّذ قبل تشغيل الموقع).
 *
 * بيزرع البيانات الافتراضية **مرة واحدة بس** — لو فيه بيانات بالفعل
 * بيسيبها زي ما هي، فمفيش خوف إن تعديلات العميل تتمسح مع كل نشر جديد.
 */
async function init() {
  try {
    const result = await db.select({ value: sql<number>`count(*)::int` }).from(services);
    const count = result[0]?.value ?? 0;

    if (count > 0) {
      console.log(`[init] قاعدة البيانات فيها بيانات بالفعل (${count} خدمة) — مفيش زرع.`);
      return;
    }

    console.log("[init] قاعدة البيانات فاضية — جاري زرع البيانات الافتراضية...");
    console.log(await seedDatabase());
  } catch (error) {
    // مش بنوقف النشر لو الزرع فشل — الموقع بيشتغل بالبيانات الثابتة
    console.error("[init] تعذّر تجهيز قاعدة البيانات:", error);
  }
}

init().then(() => process.exit(0));
