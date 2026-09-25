#!/usr/bin/env node
/**
 * توليد صور العروض (SVG) من بيانات العروض في قاعدة البيانات.
 *
 * كل صورة هي "العرض نفسه": الاسم، السعر قبل العرض، السعر بعد العرض،
 * نسبة الخصم، شارة العرض، وتاريخ انتهاء العرض.
 *
 * التشغيل:  npm run images
 * (بعد أي تعديل على أسعار أو عناوين العروض في src/db/seed.ts شغّل السكربت تاني)
 */

import { Client } from "pg";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "images");

const FONT_STACK =
  "'Segoe UI', Tahoma, 'Noto Sans Arabic', 'Geeza Pro', Arial, sans-serif";
const GOLD = "#c9a227";
const GOLD_LIGHT = "#e6c86e";
const CREAM = "#f5f0e6";
const CHARCOAL = "#1a1a1a";

const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatPrice(value) {
  return `${Number(value).toFixed(0)} ج.م`;
}

function discountPercent(oldPrice, newPrice) {
  const old = Number(oldPrice);
  const current = Number(newPrice);
  if (!old || old <= current) return 0;
  return Math.round(((old - current) / old) * 100);
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getDate()} ${AR_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function offerSvg(offer) {
  const title = escapeXml(offer.titleAr);
  const oldPrice = escapeXml(formatPrice(offer.oldPrice));
  const newPrice = escapeXml(formatPrice(offer.newPrice));
  const percent = discountPercent(offer.oldPrice, offer.newPrice);
  const badge = offer.badgeAr ? escapeXml(offer.badgeAr) : null;
  const until = formatDate(offer.validUntil);
  const savings = Math.max(0, Number(offer.oldPrice) - Number(offer.newPrice)).toFixed(0);

  // طول خط الشطب فوق السعر القديم (تقريبي حسب عدد الحروف)
  const strikeHalf = Math.min(210, Math.max(85, oldPrice.length * 16));

  const footer = until
    ? `SADDAM BARBER · العرض ساري حتى ${escapeXml(until)}`
    : "SADDAM BARBER · صالون صدام للحلاقة";

  const ariaLabel = `${offer.titleAr} - السعر قبل العرض ${formatPrice(
    offer.oldPrice
  )} وبعد العرض ${formatPrice(offer.newPrice)}${percent ? ` بخصم ${percent}%` : ""}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="1000" height="600" role="img" aria-label="${escapeXml(
    ariaLabel
  )}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#232323"/>
      <stop offset="0.55" stop-color="#151515"/>
      <stop offset="1" stop-color="#0b0b0b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GOLD_LIGHT}"/>
      <stop offset="0.5" stop-color="${GOLD}"/>
      <stop offset="1" stop-color="#9c7f1c"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0" r="0.85">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0.20"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- الخلفية -->
  <rect width="1000" height="600" fill="url(#bg)"/>
  <rect width="1000" height="600" fill="url(#glow)"/>

  <!-- خطوط خفيفة مائلة -->
  <g stroke="${GOLD}" stroke-opacity="0.05" stroke-width="2">
    <line x1="-120" y1="640" x2="280" y2="-80"/>
    <line x1="60" y1="660" x2="460" y2="-60"/>
    <line x1="720" y1="660" x2="1120" y2="-60"/>
  </g>

  <!-- الإطار الذهبي -->
  <rect x="24" y="24" width="952" height="552" rx="26" fill="none" stroke="${GOLD}" stroke-opacity="0.4" stroke-width="2"/>
  <rect x="34" y="34" width="932" height="532" rx="20" fill="none" stroke="${GOLD}" stroke-opacity="0.14" stroke-width="1"/>

  <!-- زخرفة الأركان -->
  <g fill="url(#gold)">
    <rect x="44" y="44" width="10" height="10" transform="rotate(45 49 49)"/>
    <rect x="946" y="44" width="10" height="10" transform="rotate(45 951 49)"/>
    <rect x="44" y="546" width="10" height="10" transform="rotate(45 49 551)"/>
    <rect x="946" y="546" width="10" height="10" transform="rotate(45 951 551)"/>
  </g>

  <!-- شارة نسبة الخصم -->
  ${
    percent > 0
      ? `<g>
    <circle cx="882" cy="118" r="58" fill="url(#gold)"/>
    <text x="882" y="104" text-anchor="middle" direction="rtl" font-family="${FONT_STACK}" font-size="22" font-weight="700" fill="${CHARCOAL}">خصم</text>
    <text x="882" y="150" text-anchor="middle" font-family="${FONT_STACK}" font-size="38" font-weight="800" fill="${CHARCOAL}">${percent}%</text>
  </g>`
      : ""
  }

  <!-- عنوان فرعي -->
  <g>
    <line x1="418" y1="86" x2="474" y2="86" stroke="${GOLD}" stroke-width="2"/>
    <text x="500" y="94" text-anchor="middle" direction="rtl" font-family="${FONT_STACK}" font-size="24" font-weight="600" fill="${GOLD}" letter-spacing="2">عرض خاص</text>
    <line x1="526" y1="86" x2="582" y2="86" stroke="${GOLD}" stroke-width="2"/>
  </g>

  <!-- شارة العرض -->
  ${
    badge
      ? `<g>
    <rect x="365" y="114" width="270" height="50" rx="25" fill="${GOLD}" fill-opacity="0.14" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="1.5"/>
    <text x="500" y="147" text-anchor="middle" direction="rtl" font-family="${FONT_STACK}" font-size="25" font-weight="700" fill="${GOLD_LIGHT}">${badge}</text>
  </g>`
      : ""
  }

  <!-- اسم العرض -->
  <text x="500" y="248" text-anchor="middle" direction="rtl" font-family="${FONT_STACK}" font-size="58" font-weight="800" fill="${CREAM}">${title}</text>

  <!-- فاصل -->
  <line x1="440" y1="286" x2="560" y2="286" stroke="${GOLD}" stroke-width="3"/>
  <circle cx="500" cy="286" r="6" fill="${GOLD}"/>

  <!-- السعر قبل العرض -->
  <text x="500" y="334" text-anchor="middle" direction="rtl" font-family="${FONT_STACK}" font-size="24" font-weight="600" fill="${CREAM}" fill-opacity="0.5">قبل العرض</text>
  <text x="500" y="384" text-anchor="middle" direction="rtl" font-family="${FONT_STACK}" font-size="46" font-weight="700" fill="${CREAM}" fill-opacity="0.45">${oldPrice}</text>
  <line x1="${500 - strikeHalf}" y1="370" x2="${500 + strikeHalf}" y2="370" stroke="${CREAM}" stroke-opacity="0.45" stroke-width="3"/>

  <!-- السعر بعد العرض -->
  <text x="500" y="438" text-anchor="middle" direction="rtl" font-family="${FONT_STACK}" font-size="24" font-weight="700" fill="${GOLD}">بعد العرض</text>
  <text x="500" y="514" text-anchor="middle" direction="rtl" font-family="${FONT_STACK}" font-size="82" font-weight="800" fill="url(#gold)">${newPrice}</text>

  <!-- التوفير -->
  <text x="500" y="556" text-anchor="middle" direction="rtl" font-family="${FONT_STACK}" font-size="22" font-weight="600" fill="${CREAM}" fill-opacity="0.55">وفّرت ${escapeXml(
    savings
  )} ج.م</text>

  <!-- التذييل -->
  <text x="500" y="586" text-anchor="middle" direction="rtl" font-family="${FONT_STACK}" font-size="19" font-weight="600" fill="${GOLD}" fill-opacity="0.75" letter-spacing="3">${footer}</text>
</svg>
`;
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  const { rows } = await client.query(
    `SELECT id,
            title_ar AS "titleAr",
            old_price AS "oldPrice",
            new_price AS "newPrice",
            badge_ar AS "badgeAr",
            valid_until AS "validUntil"
       FROM offers
      WHERE is_active = true
      ORDER BY id`
  );
  await client.end();

  if (rows.length === 0) {
    console.error("لا توجد عروض في قاعدة البيانات.");
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });

  for (const offer of rows) {
    const file = join(outDir, `offer-${offer.id}.svg`);
    await writeFile(file, offerSvg(offer), "utf8");
    console.log(`✓ ${relative(process.cwd(), file)}`);
  }

  console.log(`تم توليد ${rows.length} صورة عرض في public/images`);
}

main().catch((error) => {
  console.error("فشل توليد الصور:", error.message);
  process.exit(1);
});
