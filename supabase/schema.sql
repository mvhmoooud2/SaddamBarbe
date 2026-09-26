-- ============================================================
--  صالون صدام — قاعدة البيانات على Supabase
--
--  طريقة الاستخدام:
--   1) افتح مشروعك على https://supabase.com  →  SQL Editor  →  New query
--   2) الصق محتوى الملف ده كله واضغط Run
--   3) بعدها الصق ملف supabase/seed.sql (البيانات المبدئية) وشغّله
--
--  الجداول دي هي نفس الجداول اللي بيستخدمها الموقع (src/db/schema.ts).
--  تقدر تعدّل/تضيف عروض وخصومات وخدمات من:
--    • لوحة التحكم في الموقع:  /admin
--    • أو من Supabase مباشرة:  Table Editor
-- ============================================================

-- ---------- الخدمات ----------
create table if not exists public.services (
  id               serial primary key,
  name_ar          varchar(200) not null,
  name_en          varchar(200) not null,
  description_ar   text,
  description_en   text,
  price            numeric(10, 2) not null,
  duration_minutes integer not null,
  image_url        text,
  is_active        boolean not null default true,
  created_at       timestamp not null default now()
);

-- ---------- العروض والخصومات ----------
create table if not exists public.offers (
  id             serial primary key,
  title_ar       varchar(200) not null,
  title_en       varchar(200) not null,
  description_ar text,
  description_en text,
  -- تفاصيل العرض: كل سطر = نقطة في القائمة
  details_ar     text,
  details_en     text,
  old_price      numeric(10, 2) not null,
  new_price      numeric(10, 2) not null,
  image_url      text,
  badge_ar       varchar(100),
  valid_until    timestamp,
  is_active      boolean not null default true,
  created_at     timestamp not null default now()
);

-- ---------- الحلاقين ----------
create table if not exists public.barbers (
  id         serial primary key,
  name_ar    varchar(200) not null,
  name_en    varchar(200) not null,
  role_ar    varchar(200) not null,
  role_en    varchar(200) not null,
  bio_ar     text,
  bio_en     text,
  image_url  text,
  is_active  boolean not null default true,
  created_at timestamp not null default now()
);

-- ---------- الحجوزات ----------
create table if not exists public.appointments (
  id               serial primary key,
  customer_name    varchar(200) not null,
  customer_phone   varchar(50) not null,
  service_id       integer not null references public.services (id),
  barber_id        integer references public.barbers (id),
  appointment_date timestamp not null,
  notes            text,
  status           varchar(50) not null default 'pending',
  created_at       timestamp not null default now()
);

create index if not exists appointments_date_idx
  on public.appointments (appointment_date);

-- ---------- آراء العملاء ----------
create table if not exists public.testimonials (
  id            serial primary key,
  customer_name varchar(200) not null,
  comment_ar    text not null,
  comment_en    text,
  rating        integer not null,
  is_active     boolean not null default true,
  created_at    timestamp not null default now()
);

-- ---------- إعدادات عامة للموقع (مفتاح/قيمة) ----------
-- مثال: whatsapp, phone, address, hero_title_ar ... إلخ
create table if not exists public.site_settings (
  key        varchar(100) primary key,
  value      text,
  label_ar   varchar(200),
  updated_at timestamp not null default now()
);

-- ============================================================
--  الحماية (Row Level Security)
--  الموقع بيتصل بالداتابيز بالـ connection string (دور postgres)،
--  وده بيتخطى RLS — فالسياسات دي بتأمّن أي استخدام عبر Supabase API:
--    • المحتوى العام (خدمات/عروض/حلاقين/آراء): قراءة للجميع
--    • الحجوزات والإعدادات: مفيش وصول عام (بس من السيرفر / service_role)
-- ============================================================
alter table public.services      enable row level security;
alter table public.offers        enable row level security;
alter table public.barbers       enable row level security;
alter table public.testimonials  enable row level security;
alter table public.appointments  enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "public read services"     on public.services;
drop policy if exists "public read offers"       on public.offers;
drop policy if exists "public read barbers"      on public.barbers;
drop policy if exists "public read testimonials" on public.testimonials;

create policy "public read services"     on public.services     for select using (is_active);
create policy "public read offers"       on public.offers       for select using (is_active);
create policy "public read barbers"      on public.barbers      for select using (is_active);
create policy "public read testimonials" on public.testimonials for select using (is_active);

-- الحجوزات: السماح للزائر بإنشاء حجز فقط (من غير قراءة بيانات العملاء)
drop policy if exists "public insert appointments" on public.appointments;
create policy "public insert appointments" on public.appointments for insert with check (true);
