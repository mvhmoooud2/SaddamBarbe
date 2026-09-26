-- ============================================================
--  ترقيع قاعدة البيانات (Idempotent Migration)
--
--  بيضيف الأعمدة والجداول الناقصة من غير ما يمسح أي بيانات.
--  آمن إنه يتشغل أكتر من مرة (كله IF NOT EXISTS).
--
--  ليه موجود؟
--    قواعد البيانات القديمة (اللي اتعملت قبل ما نضيف أعمدة زي
--    display_name_ar / category_ar / branch_slugs / is_featured)
--    كانت بتفشل عند التعديل من لوحة التحكم بالخطأ:
--      column "display_name_ar" of relation "services" does not exist
--    السكربت ده بيصلّح الدريفت ده.
-- ============================================================

-- ---------- services ----------
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name_ar VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);
ALTER TABLE services ADD COLUMN IF NOT EXISTS display_name_ar VARCHAR(200);
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_ar VARCHAR(200);
ALTER TABLE services ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS branch_slugs TEXT DEFAULT '' NOT NULL;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- ---------- offers ----------
ALTER TABLE offers ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS details_ar TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS details_en TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS badge_ar VARCHAR(100);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- ---------- barbers ----------
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS bio_ar TEXT;
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS bio_en TEXT;
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- ---------- testimonials ----------
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS comment_en TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- ---------- branches ----------
ALTER TABLE branches ADD COLUMN IF NOT EXISTS listing_name_ar VARCHAR(200);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS badge_ar VARCHAR(100);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS landmark_ar TEXT;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS summary_ar TEXT;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS price_list_image TEXT;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS google_rating DOUBLE PRECISION;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS google_reviews INTEGER;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS maps_url TEXT;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- ---------- gallery_images ----------
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;
