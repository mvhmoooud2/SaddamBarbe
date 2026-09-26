# نشر مجاني دائم — Vercel + Neon 🆓

طريقة تانية للرابط الدائم، **مجانية بالكامل ومن غير تاريخ انتهاء**، وأحسن من
Render في 3 حاجات:

| | Vercel + Neon | Render (الخطة المجانية) |
| --- | --- | --- |
| السيرفر بينام؟ | ❌ **لأ، شغال دايماً** | ✅ بينام بعد 15 دقيقة |
| قاعدة البيانات | **مجانية دائمة** (Neon) | مجانية 30 يوم بس |
| سرعة الموقع | CDN عالمي سريع جداً | عادية |
| الصور المرفوعة | ✅ بتتخزن في قاعدة البيانات (شغل متظبط بالفعل) | نفس الكلام |

> ✅ الصور اللي العميل يرفعها من لوحة التحكم بقت **بتتخزن جوه قاعدة البيانات**
> وبتتعرض عن طريق `/api/media/…` — يعني بتفضل موجودة مهما اتعمل نشر جديد،
> ومفيش أي مشكلة مع أنظمة الملفات المؤقتة.

---

## الخطوة 1: قاعدة بيانات مجانية من Neon (3 دقايق)

1. ادخل <https://neon.tech> → **Sign up with GitHub** (مجاني، من غير كارت)
2. اضغط **Create project**:
   - Name: `saddam-barber`
   - Region: **Europe (Frankfurt)** ← الأقرب لمصر
3. بعد الإنشاء هيظهرلك **Connection string** بالشكل ده — انسخه:

```
postgresql://user:password@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

---

## الخطوة 2: نشر الموقع على Vercel (5 دقايق)

1. ادخل <https://vercel.com> → **Sign up with GitHub**
2. **Add New → Project** → اختار مستودع **`SaddamBarber`** → **Import**
3. قبل ما تضغط Deploy، افتح **Environment Variables** وحط:

| الاسم | القيمة |
| --- | --- |
| `DATABASE_URL` | اللينك اللي نسخته من Neon |
| `ADMIN_PASSWORD` | كلمة سر قوية للوحة التحكم |
| `ADMIN_SECRET` | أي نص طويل عشوائي |

4. اضغط **Deploy** واستنى ~3 دقايق.

> Vercel بيشغّل أمر `vercel-build` الموجود في `package.json`، وهو بيعمل لوحده:
> إنشاء الجداول (`db:push`) → زرع البيانات أول مرة بس (`db:init`) → بناء الموقع.

---

## الخطوة 3: الروابط بتاعتك

```
https://saddam-barber.vercel.app            ← الموقع
https://saddam-barber.vercel.app/admin      ← لوحة التحكم
https://saddam-barber.vercel.app/api/health ← لازم يرجّع {"ok":true}
```

### دومين العميل
Project → **Settings → Domains → Add** → اكتب `saddambarber.com` واتبع تعليمات
الـ DNS. الـ SSL بيتظبط تلقائياً ومجاناً.

---

## ملاحظات مهمة

- **أي تعديل على المستودع بيتنشر تلقائياً** (كل push على `main`).
- Neon المجانية بتنام بعد 5 دقايق سكون، بس بتصحى في **أقل من ثانية** —
  مش زي Render.
- حدود Neon المجانية: 0.5 جيجا تخزين — تكفي جداً لموقع الصالون
  (الصور الكبيرة جداً بتاكل مساحة، فحاول الصور تكون أقل من 1 ميجا).
- لو حبيت الصور تتخزن على قرص السيرفر بدل قاعدة البيانات (على VPS مثلاً)
  حط المتغيّر: `MEDIA_STORAGE=disk`.

---

## لو حصلت مشكلة

| المشكلة | الحل |
| --- | --- |
| البناء فشل بخطأ اتصال | اتأكد إن `DATABASE_URL` مكتوب صح وفيه `?sslmode=require` |
| `/api/health` يرجّع `ok:false` | نفس السبب — راجع `DATABASE_URL` في Settings → Environment Variables |
| الموقع شغال بالبيانات الافتراضية | الزرع مااشتغلش: افتح **Deployments → Redeploy** |
| نسيت كلمة سر اللوحة | غيّر `ADMIN_PASSWORD` من Environment Variables ثم **Redeploy** |
