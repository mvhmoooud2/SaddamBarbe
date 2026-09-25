# SADDAM BARBER — موقع صالون صدام للحلاقة

موقع تعريفي كامل (عربي / RTL) لصالون حلاقة: خدمات، عروض بخصومات، معرض صور، فريق العمل،
آراء العملاء، ونموذج حجز مواعيد.

- **النسخة الحيّة على GitHub Pages:** https://mvhmoooud2.github.io/SaddamBarbe/
  (نسخة ثابتة بالبيانات الأساسية، بدون قاعدة بيانات وبدون API)
- **النسخة الكاملة** (بقاعدة بيانات + حجز فعلي): تشتغل بـ Next.js + PostgreSQL.

---

## تشغيل الموقع محلياً

### الطريقة السريعة (بتجهّز كل حاجة لوحدها)

```bash
npm run dev:up
```

السكربت ده بيشتغل: تثبيت الحاجات → تجهيز PostgreSQL محلي → بناء الجداول وزرع البيانات →
تشغيل الموقع على <http://localhost:3000>

### الطريقة اليدوية

```bash
cp .env.example .env        # وعدّل DATABASE_URL حسب إعداداتك
npm install
npx drizzle-kit push --force   # بناء الجداول
npm run seed                   # زرع البيانات
npm run dev                    # http://localhost:3000
```

> لو قاعدة البيانات مش متاحة، الموقع **مش بيفصل** — بيشتغل تلقائياً بالبيانات
> الثابتة الموجودة في `src/data/seed-data.ts`.

---

## نشر نسخة GitHub Pages (النسخة الثابتة)

النشر بيحصل تلقائياً: أي دفع على فرع `main` بيشغّل
[workflow النشر](.github/workflows/deploy-pages.yml) اللي بيبني نسخة ثابتة ويرفعها على Pages.

للتجربة محلياً **بنفس مسار GitHub Pages** (مهم جداً):

```bash
npm run build:pages      # بينتج مجلد out/
npm run preview:static   # يعرضها على http://localhost:4000/SaddamBarbe/
```

### ⚠️ قاعدة مهمة

GitHub Pages بيخدم الموقع على `/<اسم-المستودع>` وليس على الجذر، والمستودع اسمه
`SaddamBarbe`، فالمسار هو **`/SaddamBarbe`**.

لازم `NEXT_PUBLIC_BASE_PATH` يساوي نفس المسار في بناء نسخة Pages
(الـ workflow بيظبطه تلقائياً). لو المسار غلط، ملفات CSS/JS والصور كلها بترجع 404
والصفحة تظهر بدون تصميم وبدون أي تفاعل.

نفس المتغير مستخدم في `next.config.ts` وفي `src/lib/base-path.ts` (دالة `asset()`)
علشان مسار الصفحة ومسار ملفات الصور يبقوا متطابقين دايماً.

### نسخة Pages بتشتغل إزاي؟

- مفيش قاعدة بيانات ومفيش API routes → الصفحة بتتبني بالبيانات الثابتة.
- نموذج الحجز بيحوّل الطلب لواتساب تلقائياً (زر «ابعت الحجز على واتساب»).

---

## تعديل بيانات الموقع

| إيه اللي عايز تغيّره | الملف |
| --- | --- |
| رقم الهاتف / الواتساب / العنوان / مواعيد العمل / السوشيال | `src/data/site-config.ts` |
| الخدمات، العروض، الفريق، آراء العملاء | `src/data/seed-data.ts` (وبعدها `npm run seed` للنسخة بقاعدة البيانات) |
| صور الموقع | `public/images/` |
| الألوان والهوية | `src/app/globals.css` + الألوان داخل المكوّنات `text-[#c9a227]` |

> النصوص والأرقام الحالية (العنوان ورقم الموبايل والسوشيال) **بيانات مؤقتة** —
> عدّلها من `src/data/site-config.ts` قبل ما تعرض الموقع على العملاء.

---

## أوامر مفيدة

```bash
npm run dev            # تشغيل بيئة التطوير
npm run build          # بناء نسخة الإنتاج (سيرفر + قاعدة بيانات)
npm run build:pages    # بناء نسخة GitHub Pages الثابتة
npm run preview:static # معاينة النسخة الثابتة بنفس مسار Pages
npm run lint           # فحص الكود
npm run typecheck      # فحص الأنواع
npm run seed           # إعادة زرع بيانات قاعدة البيانات
```

## التقنيات

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Drizzle ORM · PostgreSQL · lucide-react
