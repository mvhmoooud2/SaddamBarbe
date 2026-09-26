# دليل نشر الموقع على Vercel وربطه بـ GitHub — SADDAM BARBER

دليل خطوة بخطوة لنشر الموقع على منصة **Vercel** مجاناً مع ربطه بـ **GitHub** و **Supabase**.

---

## الخطوة 1: رفع المشروع على GitHub

1. تأكد من عمل Commit لجميع التغييرات على مستودع GitHub:
   ```bash
   git add .
   git commit -m "feat: integrate Supabase database, auth, storage and full admin dashboard"
   git push origin <your-branch>
   ```

---

## الخطوة 2: النشر على Vercel (3 دقائق)

1. ادخل إلى [vercel.com](https://vercel.com) وسجل الدخول بحساب GitHub الخاص بك.
2. اضغط على **Add New...** -> **Project**.
3. اختر مستودع **`SaddamBarber`** واضغط **Import**.
4. في شاشة الإعدادات، افتح تبويب **Environment Variables** وأضف المتغيرات التالية:

| Variable Name | Description / Example |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | رابط مشروع Supabase (مثال: `https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | مفتاح Anon Key العام من Supabase |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | `saddam-media` |
| `ADMIN_PASSWORD` | كلمة سر الأدمن (مثال: `saddam2026`) |

5. اضغط على زر **Deploy** الأخضر.
6. ستقوم Vercel ببناء المشروع في غضون دقيقة واحدة وستعطيك رابطاً حياً مثل: `https://saddambarber.vercel.app`.

---

## الخطوة 3: ربط دومين مخصص (Custom Domain - اختياري)

1. في لوحة تحكم مشروعك على Vercel، اذهب إلى **Settings** -> **Domains**.
2. أضف الدومين الخاص بالعميل (مثال: `saddambarber.com` أو `www.saddambarber.com`).
3. اضبط سجلات الـ DNS (A Record / CNAME) في مزود الدومين حسب توجيهات Vercel.
4. سيتم تفعيل شهادة SSL المجانية تلقائياً ويكون الموقع جاهزاً.

---

## النتيجة النهائية:
- الموقع الحي: `https://saddambarber.com`
- لوحة تحكم العميل: `https://saddambarber.com/admin`
