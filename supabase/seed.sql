-- ============================================================
--  بيانات مبدئية لصالون صدام (متولّدة تلقائياً — لا تعدّلها يدوياً)
--  شغّل supabase/schema.sql الأول، بعدين الملف ده.
--  تحذير: الملف ده بيمسح المحتوى الحالي ويرجّعه للبيانات الأصلية.
-- ============================================================
begin;

truncate table public.appointments restart identity cascade;
truncate table public.testimonials restart identity cascade;
truncate table public.offers restart identity cascade;
truncate table public.barbers restart identity cascade;
truncate table public.services restart identity cascade;

insert into public.services (name_ar, name_en, description_ar, description_en, price, duration_minutes, image_url, is_active) values
  ('قص شعر (فوطة سخنة وفوطة ساقعه)', 'Haircut (Hot & Cold Towel)', 'قص شعر احترافي يناسب شكل وجهك، مع فوطة سخنة قبل القص وفوطة ساقعه بعده.', 'A professional haircut for your face shape, with a hot towel before and a cold towel after.', '250.00', 45, '/images/service-haircut.jpg', true),
  ('قص أطفال', 'Kids Haircut', 'قصة شعر مريحة وسريعة للأطفال بتعامل هادي وسعر مناسب.', 'A comfortable, quick haircut for kids at a friendly price.', '200.00', 30, '/images/service-haircut.jpg', true),
  ('دقن بخار', 'Steam Beard Shave', 'حلاقة وتشكيل الذقن بالبخار لفتح المسام، بتمريرة ناعمة ومن غير تهيج.', 'Steam shave for a close, smooth beard line without irritation.', '200.00', 30, '/images/service-beard.jpg', true),
  ('دقن (فوطة ساقعة)', 'Beard Shave (Cold Towel)', 'تهذيب وتشكيل الذقن بدقة عالية مع فوطة ساقعة بعد الحلاقة.', 'Precise beard trimming and shaping with a cold towel finish.', '150.00', 25, '/images/service-beard.jpg', true),
  ('شعر + دقن + سكرب + حمام كريم', 'Haircut + Beard + Scrub + Cream Bath', 'الباقة الكاملة: قصة شعر وذقن مع سكرب للوجه وفوطتين (سخنة وساقعة) وحمام كريم.', 'The full package: haircut and beard with a face scrub, hot and cold towels, and a cream bath.', '500.00', 90, '/images/service-combo.jpg', true),
  ('شوار', 'Blow Dry', 'تسريح وتجفيف الشعر بالسيشوار بلمسة نهائية مرتبة.', 'Hair drying and styling with a neat finishing touch.', '150.00', 20, '/images/gallery-6.jpg', true),
  ('بشرة VIP', 'VIP Facial', 'تنظيف وتفتيح البشرة بمنتجات فاخرة مع ماسك وترطيب عميق ونتيجة واضحة من أول جلسة.', 'Luxury facial cleansing and brightening with a mask and deep hydration.', '500.00', 60, '/images/service-facial.jpg', true),
  ('هيدروفاشيال 7 مراحل', 'Hydrafacial (7 Steps)', 'جلسة هيدروفاشيال بـ7 مراحل لتنظيف البشرة وإزالة الرؤوس السوداء وتجديد النضارة.', 'A 7-step hydrafacial that deep-cleans the skin and restores its glow.', '800.00', 60, '/images/gallery-3.jpg', true),
  ('هيدروفاشيال 11 مرحلة', 'Hydrafacial (11 Steps)', 'الجلسة الأشمل بـ11 مرحلة عناية بالبشرة، لنتيجة أعمق وثبات أطول.', 'Our most complete skin treatment with 11 steps for deeper, longer-lasting results.', '1200.00', 75, '/images/gallery-1.jpg', true),
  ('وكس كامل', 'Full Body Wax', 'إزالة الشعر بالشمع للجسم بالكامل بمنتجات لطيفة على البشرة.', 'Full-body waxing with products that are gentle on the skin.', '200.00', 45, '/images/gallery-2.jpg', true),
  ('وكس عادي', 'Regular Wax', 'وكس سريع للمناطق المطلوبة بسعر مناسب.', 'A quick wax for the requested areas at a fair price.', '150.00', 30, '/images/gallery-2.jpg', true),
  ('صبغة شعر', 'Hair Coloring', 'ألوان عصرية بجودة عالية وثبات طويل ومنتجات آمنة على الشعر.', 'Modern colors with high quality, long-lasting hold and safe products.', '300.00', 90, '/images/service-coloring.jpg', true),
  ('توبيك', 'Toppik (Hair Coverage)', 'تغطية فراغات الشعر والمناطق الخفيفة ببودرة توبيك بلون مطابق لشعرك.', 'Covering thin patches with toppik powder in a shade that matches your hair.', '150.00', 30, '/images/service-coloring.jpg', true),
  ('حمام زيت', 'Hot Oil Bath', 'حمام زيت دافئ لترطيب الشعر وتغذيته من الجذور للأطراف.', 'A warm oil treatment that nourishes hair from root to tip.', '200.00', 30, '/images/gallery-5.jpg', true),
  ('حمام زيت أمبول', 'Ampoule Oil Bath', 'حمام زيت بأمبول مركز لعلاج الشعر التالف وإرجاع الحيوية واللمعان.', 'An oil bath with a concentrated ampoule to repair damaged hair and restore shine.', '350.00', 45, '/images/gallery-4.jpg', true),
  ('جلسة ترميم شعر', 'Hair Repair Session', 'جلسة علاجية لترميم الشعر التالف وتقوية البصيلات وتقليل التساقط.', 'A treatment session that repairs damaged hair, strengthens follicles and reduces hair fall.', '500.00', 60, '/images/gallery-6.jpg', true),
  ('فرد أمريكي', 'American Hair Straightening', 'فرد الشعر بالطريقة الأمريكية لشعر ناعم ومفرود بشكل طبيعي.', 'American-style straightening for smooth, naturally straight hair.', '250.00', 90, '/images/service-coloring.jpg', true),
  ('بروتين (السعر لكل جرام)', 'Protein Treatment (per gram)', 'علاج بالبروتين لتقوية الشعر وتنعيمه — السعر لكل جرام، والتكلفة النهائية حسب عدد الجرامات.', 'Protein treatment to strengthen and smooth hair — priced per gram, final cost depends on the amount used.', '70.00', 120, '/images/gallery-6.jpg', true),
  ('كافيار (السعر لكل جرام)', 'Caviar Treatment (per gram)', 'علاج الكافيار لتغذية الشعر بعمق ولمعان صحي — السعر لكل جرام، والتكلفة النهائية حسب عدد الجرامات.', 'Caviar treatment for deep nourishment and healthy shine — priced per gram, final cost depends on the amount used.', '80.00', 120, '/images/gallery-4.jpg', true),
  ('بونكس (السعر لكل جرام)', 'Bonx Treatment (per gram)', 'علاج بونكس لإعادة بناء الشعر التالف — السعر لكل جرام، والتكلفة النهائية حسب عدد الجرامات.', 'Bonx treatment to rebuild damaged hair — priced per gram, final cost depends on the amount used.', '85.00', 120, '/images/gallery-1.jpg', true),
  ('كيراتين (السعر لكل جرام)', 'Keratin Treatment (per gram)', 'علاج الكيراتين لفرد وتنعيم الشعر — السعر لكل جرام، والتكلفة النهائية حسب عدد الجرامات.', 'Keratin treatment for straightening and smoothing — priced per gram, final cost depends on the amount used.', '60.00', 120, '/images/service-coloring.jpg', true),
  ('باديكير قدم', 'Pedicure', 'عناية كاملة بالقدمين: تنظيف وتقشير وترطيب وتشكيل الأظافر.', 'Complete foot care: cleansing, exfoliation, moisturizing and nail shaping.', '350.00', 45, '/images/gallery-2.jpg', true),
  ('باديكير يد', 'Manicure', 'عناية كاملة باليدين: تقشير وترطيب وتهذيب الأظافر.', 'Complete hand care: exfoliation, moisturizing and nail care.', '250.00', 30, '/images/gallery-2.jpg', true),
  ('باديكير علاجي (يد + قدم)', 'Therapeutic Manicure & Pedicure', 'برنامج علاجي متكامل لليدين والقدمين لعلاج الجفاف والتشققات وتشكيل الأظافر.', 'A complete therapeutic program for hands and feet that treats dryness and cracks.', '750.00', 75, '/images/gallery-4.jpg', true),
  ('ساونا علاجي', 'Therapeutic Sauna', 'جلسة ساونا لفتح المسام وتنشيط الدورة الدموية وتهدئة الجسم.', 'A sauna session to open pores, boost circulation and relax the body.', '400.00', 45, '/images/gallery-5.jpg', true),
  ('استيم + ليفة مغربي', 'Steam + Moroccan Loofah', 'جلسة بخار مع تقشير بالليفة المغربي لتنظيف الجسم بالكامل ونعومة فورية.', 'A steam session with a Moroccan loofah scrub for a full-body clean and instant smoothness.', '500.00', 60, '/images/gallery-1.jpg', true),
  ('جاكوزي', 'Jacuzzi', 'جلسة جاكوزي مهدئة للعضلات بعد يوم طويل.', 'A calming jacuzzi session to soothe tired muscles.', '350.00', 45, '/images/service-combo.jpg', true),
  ('مساج (45 دقيقة – مدرب)', 'Massage (45 min – Trained)', 'جلسة مساج 45 دقيقة على إيد مدرب، لاسترخاء العضلات وتخفيف التوتر.', 'A 45-minute massage by a trained therapist to relax muscles and release tension.', '650.00', 45, '/images/service-massage.jpg', true),
  ('مساج (60 دقيقة)', 'Massage (60 min)', 'جلسة مساج كاملة 60 دقيقة لاسترخاء تام للجسم.', 'A full 60-minute massage session for total body relaxation.', '800.00', 60, '/images/service-massage.jpg', true);

insert into public.offers (title_ar, title_en, description_ar, description_en, details_ar, details_en, old_price, new_price, image_url, badge_ar, is_active) values
  ('عرض العريس VIP', 'Groom VIP Package', 'تجربة متكاملة تخليك في أفضل لوك وأعلى استرخاء قبل أهم يوم في حياتك.', 'A complete grooming and relaxation experience before the biggest day of your life.', 'قص شعر.
دقن بخار.
تنظيف بشرة (هيدروفيشال 12 مرحلة).
وكس كامل.
صبغة شعر.
توبيك لفراغات الشعر.
باديكير يد + بدكير قدم.
ساونا واسترخاء.
استيم + ليفة مغربي.
جاكوزي.
جلسة ترميم شعر.
مساج 45 دقيقة مع مدرب متخصص.
سشوار + تثبيت اللوك النهائي.
حمام كريم.
مميزات إضافية: لوكر خاص، شاور، غرفة تغيير خاصة، تعقيم كامل وأدوات شخصية.', 'Haircut.
Steam beard treatment.
Hydrofacial skin cleansing (12 stages).
Full body wax.
Hair coloring.
Topik for hair gaps.
Hand and foot pedicure.
Sauna and relaxation.
Steam session + Moroccan bath scrub.
Jacuzzi.
Hair repair session.
45-minute massage with a specialist therapist.
Blow-dry + final look styling.
Cream bath treatment.
Extras: private locker, shower, private changing room, full sterilization and personal tools.', '5500.00', '2900.00', '/images/offer-groom-2900.jpeg', 'الباقة الملكية', true),
  ('عرض العريس 1', 'Groom Package 1', 'تجربة متكاملة تخليك في أفضل لوك وأعلى استرخاء قبل أهم يوم في حياتك.', 'A complete grooming and relaxation experience before the biggest day of your life.', 'قص شعر.
دقن بخار.
تنظيف بشرة (هيدروفيشال 7 مراحل).
وكس كامل.
صبغة شعر.
توبيك لفراغات الشعر.
باديكير يد.
ساونا واسترخاء.
استيم + ليفة مغربي.
جاكوزي.
مساج 45 دقيقة مع مدرب متخصص.
حمام كريم + جلسة ترميم شعر.
سشوار + تثبيت اللوك النهائي.
مميزات إضافية: لوكر خاص، شاور، غرفة تغيير خاصة، تعقيم كامل وأدوات شخصية.', 'Haircut.
Steam beard treatment.
Hydrofacial skin cleansing (7 stages).
Full body wax.
Hair coloring.
Topik for hair gaps.
Hand pedicure.
Sauna and relaxation.
Steam session + Moroccan bath scrub.
Jacuzzi.
45-minute massage with a specialist therapist.
Cream bath + hair repair session.
Blow-dry + final look styling.
Extras: private locker, shower, private changing room, full sterilization and personal tools.', '4500.00', '1800.00', '/images/offer-groom-1800.jpeg', 'الأكثر طلباً', true),
  ('عرض العريس 2', 'Groom Package 2', 'تجربة متكاملة تخليك في أفضل لوك وأعلى استرخاء قبل أهم يوم في حياتك.', 'A complete grooming and relaxation experience before the biggest day of your life.', 'قص شعر.
دقن بخار.
تنظيف بشرة (سيشنال 7 مراحل).
وكس كامل.
صبغة شعر.
تويك.
باديكير يد.
تسبيتات.
سشوار.
مميزات إضافية: لوكر خاص، شاور، غرفة تغيير خاصة.
أسعار شاملة.', 'Haircut.
Steam beard treatment.
Skin cleansing (7 stages).
Full body wax.
Hair coloring.
Topik for hair gaps.
Hand pedicure.
Hair fixing treatment.
Blow-dry.
Extras: private locker, shower, private changing room.
All-inclusive pricing.', '2500.00', '1000.00', '/images/offer-groom-1000.jpeg', 'أسعار شاملة', true),
  ('عرض العريس 3', 'Groom Package 3', 'محتاج تروق على نفسك؟ الحق عرض العريس 3 بسعر مخفّض.', 'Need to treat yourself? Grab the Groom Package 3 at a discounted price.', 'قص شعر.
سشوار.
دقن.
تنظيف بشرة VIP.', 'Haircut.
Blow-dry.
Beard grooming.
VIP skin cleansing.', '1150.00', '700.00', '/images/offer-saddam-700.jpeg', 'عرض سريع', true);

insert into public.barbers (name_ar, name_en, role_ar, role_en, bio_ar, bio_en, image_url, is_active) values
  ('صدّام', 'Saddam', 'مالك وكبير الحلاقين', 'Owner & Master Barber', 'خبرة أكثر من 15 عاماً في فن الحلاقة والعناية بالرجل.', 'Over 15 years of experience in the art of barbering and men''s grooming.', '/images/barber-saddam.jpg', true),
  ('أحمد', 'Ahmed', 'حلاق محترف', 'Professional Barber', 'متخصص في القصات العصرية والتفاصيل الدقيقة.', 'Specialized in modern cuts and fine details.', '/images/barber-ahmed.jpg', true),
  ('محمد', 'Mohamed', 'حلاق ذقون', 'Beard Specialist', 'خبير في تهذيب وتشكيل الذقن بأحدث الطرق.', 'Expert in beard trimming and shaping with the latest techniques.', '/images/barber-mohamed.jpg', true);

insert into public.testimonials (customer_name, comment_ar, comment_en, rating, is_active) values
  ('عمر خالد', 'أفضل صالون حلاقة زرته على الإطلاق. الخدمة ممتازة والأجواء رائعة.', 'The best barbershop I''ve ever visited. Excellent service and great atmosphere.', 5, true),
  ('كريم محمود', 'الحلاق عارف شغله كويس جداً. القصة طلعت زي ما كنت عايزها بالظبط.', 'The barber really knows his craft. The cut came out exactly as I wanted.', 5, true),
  ('يوسف سامي', 'نظافة واحترافية عالية. سعر مناسب جداً مقابل الجودة.', 'High cleanliness and professionalism. Very fair price for the quality.', 4, true);

insert into public.site_settings (key, value, label_ar) values
  ('whatsapp', '201061402242', 'رقم الواتساب'),
  ('phone', '01061402242', 'رقم التليفون'),
  ('address', 'مدينة نصر، القاهرة', 'العنوان'),
  ('hours', 'يومياً من 11 صباحاً حتى 2 بعد منتصف الليل', 'مواعيد العمل')
on conflict (key) do nothing;

commit;
