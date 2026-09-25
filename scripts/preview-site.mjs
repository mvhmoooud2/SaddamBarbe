// ============================================================
//  صورة معاينة للموقع كامل (كل الأقسام)
//
//    node scripts/preview-site.mjs
//
//  محتاج sharp:  npm install --no-save sharp
// ============================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.PREVIEW_OUT || "/home/user/offers-preview";

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("محتاج sharp:  npm install --no-save sharp");
  process.exit(1);
}

const FONT = "'Segoe UI', Tahoma, 'Noto Sans Arabic', 'Geeza Pro', Arial, sans-serif";
const GOLD = "#c9a227", GOLD_L = "#e6c86e", CREAM = "#f5f0e6", DARK = "#0f0f0f", CARD = "#1a1a1a";
const W = 1440;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const num = (v) => Number(v).toFixed(0);

function wrap(text, fs, maxW, maxLines = 2) {
  const per = Math.max(8, Math.floor(maxW / (fs * 0.55)));
  const words = String(text).split(/\s+/), lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > per && cur) { lines.push(cur); cur = w; if (lines.length === maxLines) break; }
    else cur = next;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length)
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -2) + "…";
  return lines;
}
function text(x, y, s, { size = 20, fill = CREAM, weight = 400, anchor = "middle", spacing = 0, opacity = 1, strike = false } = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" fill-opacity="${opacity}"${spacing ? ` letter-spacing="${spacing}"` : ""}${strike ? ` text-decoration="line-through"` : ""}>${esc(s)}</text>`;
}

const iconCache = {};
function iconShapes(n) {
  if (iconCache[n]) return iconCache[n];
  const src = readFileSync(join(ROOT, `node_modules/lucide-react/dist/esm/icons/${n}.mjs`), "utf8");
  return (iconCache[n] = {
    paths: [...src.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]),
    circles: [...src.matchAll(/<circle([^>]*)\/>/g)].map((m) => m[1]),
  });
}
function icon(n, x, y, size, color, sw = 2) {
  const { paths, circles } = iconShapes(n);
  const s = size / 24;
  const body = [...paths.map((d) => `<path d="${d}"/>`), ...circles.map((a) => `<circle${a}/>`)].join("");
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
}
const img = (file, x, y, w, h, clip) =>
  `<image href="data:image/${file.endsWith("svg") ? "svg+xml" : "jpeg"};base64,${readFileSync(join(ROOT, "public", file.replace(/^\//, ""))).toString("base64")}" x="${x}" y="${y}" width="${w}" height="${h}"${clip ? ` clip-path="url(#${clip})"` : ""} preserveAspectRatio="xMidYMid slice"/>`;

function placeholder(x, y, w, h, label, ic = "image") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#141414"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${GOLD}" stroke-opacity="0.18" stroke-dasharray="6 6"/>
  ${icon(ic, x + w / 2 - 14, y + h / 2 - 26, 28, GOLD, 1.5)}
  ${text(x + w / 2, y + h / 2 + 18, label, { size: 14, fill: CREAM, opacity: 0.45 })}`;
}

// ---------- الداتا ----------
const pgMod = await import(join(ROOT, "node_modules/pg/lib/index.js"));
const { Client } = pgMod.default ?? pgMod;
const c = new Client({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db" });
await c.connect();
const q = async (sql) => (await c.query(sql)).rows;
const services = await q(`SELECT name_ar AS "nameAr", price, duration_minutes AS "duration", image_url AS "imageUrl" FROM services WHERE is_active ORDER BY id`);
const offers = await q(`SELECT id, title_ar AS "titleAr", description_ar AS "descriptionAr", old_price AS "oldPrice", new_price AS "newPrice", badge_ar AS "badgeAr" FROM offers WHERE is_active ORDER BY id`);
const barbers = await q(`SELECT name_ar AS "nameAr", role_ar AS "roleAr", bio_ar AS "bioAr", image_url AS "imageUrl" FROM barbers WHERE is_active ORDER BY id`);
const testimonials = await q(`SELECT customer_name AS "name", comment_ar AS "comment", rating FROM testimonials WHERE is_active ORDER BY id`);
await c.end();

let Y = 0;
const parts = [];
const section = (svg, h) => { parts.push(svg); Y += h; };

// ============ 1) الهيدر ============
const nav = ["الرئيسية", "الخدمات", "العروض", "معرض الصور", "الفريق", "احجز موعدك", "آراء العملاء", "تواصل معنا"];
let navSvg = "";
nav.forEach((n, i) => { navSvg += text(1240 - i * 118, 44, n, { size: 15, fill: CREAM, anchor: "middle", opacity: i === 2 ? 1 : 0.75, weight: i === 2 ? 700 : 400 }); });
section(`<rect width="${W}" height="72" fill="${DARK}" fill-opacity="0.95"/>
  ${icon("scissors", 60, 26, 22, GOLD)}
  ${text(96, 44, "SADDAM", { size: 19, fill: CREAM, weight: 700, anchor: "start", spacing: 1 })}
  ${text(178, 44, "BARBER", { size: 19, fill: GOLD, weight: 700, anchor: "start", spacing: 1 })}
  ${navSvg}
  <rect x="240" y="20" width="118" height="34" rx="17" fill="${GOLD}"/>
  ${text(299, 43, "احجز الآن", { size: 14, fill: DARK, weight: 700 })}`, 72);

// ============ 2) الهيرو ============
section(`<g transform="translate(0 72)">
  <rect width="${W}" height="500" fill="#121212"/>
  <rect width="${W}" height="500" fill="url(#heroGlow)"/>
  <defs><radialGradient id="heroGlow" cx="0.5" cy="0.2" r="0.8">
    <stop offset="0" stop-color="${GOLD}" stop-opacity="0.13"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
  </radialGradient></defs>
  ${placeholder(40, 120, 240, 260, "صورة الصالون (hero.jpg)", "store")}
  ${placeholder(W - 280, 120, 240, 260, "صورة الصالون (hero.jpg)", "store")}
  ${text(W / 2, 190, "تجربة حلاقة فاخرة", { size: 18, fill: GOLD, weight: 500, spacing: 3 })}
  <text x="${W / 2}" y="268" text-anchor="middle" font-family="${FONT}" font-size="84" font-weight="700"><tspan fill="${CREAM}">SADDAM </tspan><tspan fill="${GOLD}">BARBER</tspan></text>
  ${wrap("حيث يلتقي الأناقة بالاحترافية. احصل على قصة شعر عصرية وذقن متهذبة في أجواء رجالية مميزة.", 20, 640, 2).map((l, i) => text(W / 2, 322 + i * 30, l, { size: 20, fill: CREAM, opacity: 0.8 })).join("")}
  <rect x="${W / 2 - 250}" y="400" width="230" height="56" rx="28" fill="${GOLD}"/>
  ${icon("calendar", W / 2 - 232, 417, 22, DARK, 2.2)}
  ${text(W / 2 - 110, 436, "احجز موعدك الآن", { size: 17, fill: DARK, weight: 700 })}
  <rect x="${W / 2 + 20}" y="400" width="230" height="56" rx="28" fill="none" stroke="${CREAM}" stroke-opacity="0.3"/>
  ${text(W / 2 + 135, 436, "اكتشف خدماتنا", { size: 17, fill: CREAM, weight: 600 })}
</g>`, 500);

// ============ 3) الخدمات ============
const sTitle = (main, sub, eye) => `
  ${text(W / 2, Y + 46, eye, { size: 15, fill: GOLD, weight: 500, spacing: 3 })}
  ${text(W / 2, Y + 92, main, { size: 40, fill: CREAM, weight: 700 })}
  ${text(W / 2, Y + 128, sub, { size: 17, fill: CREAM, opacity: 0.65 })}`;

let sCards = "";
const scw = 300, sgap = 30, sx0 = (W - (3 * scw + 2 * sgap)) / 2;
services.forEach((s, i) => {
  const x = sx0 + (i % 3) * (scw + sgap), y = Y + 165 + Math.floor(i / 3) * 300;
  const clip = `sc${i}`;
  sCards += `<defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${scw}" height="150" rx="12"/></clipPath></defs>
  <rect x="${x}" y="${y}" width="${scw}" height="270" rx="16" fill="${CARD}" stroke="${GOLD}" stroke-opacity="0.12"/>
  ${s.imageUrl && existsSync(join(ROOT, "public", s.imageUrl)) ? img(s.imageUrl, x, y, scw, 150, clip) : placeholder(x, y, scw, 150, s.imageUrl || "صورة الخدمة", "scissors")}
  <rect x="${x + 12}" y="${y + 122}" width="86" height="28" rx="14" fill="${GOLD}"/>
  ${text(x + 55, y + 141, `${num(s.price)} ج.م`, { size: 14, fill: DARK, weight: 700 })}
  ${text(x + scw - 16, y + 186, s.nameAr, { size: 19, fill: CREAM, weight: 700, anchor: "start" })}
  ${icon("clock", x + scw - 16, y + 214, 15, GOLD)}
  ${text(x + scw - 36, y + 227, `${s.duration} دقيقة`, { size: 14, fill: CREAM, anchor: "start", opacity: 0.55 })}`;
});
section(sTitle("خدماتنا المميزة", "نقدم باقة متكاملة من خدمات العناية بالرجل بأعلى معايير الجودة والاحترافية.", "ما نقدمه") + sCards, 165 + 2 * 300 + 60);

// ============ 4) العروض ============
let oCards = "";
offers.forEach((o, i) => {
  const x = sx0 + (i % 3) * (scw + sgap), y = Y + 165 + Math.floor(i / 3) * 300;
  const clip = `oc${i}`;
  oCards += `<defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${scw}" height="180" rx="12"/></clipPath></defs>
  <rect x="${x}" y="${y}" width="${scw}" height="270" rx="16" fill="${CARD}" stroke="${GOLD}" stroke-opacity="0.22"/>
  ${img(`/images/offer-${o.id}.svg`, x, y, scw, 180, clip)}
  ${wrap(o.descriptionAr, 16, scw - 32, 2).map((l, li) => text(x + scw - 16, y + 224 + li * 23, l, { size: 16, fill: CREAM, anchor: "start", opacity: 0.7 })).join("")}
  <rect x="${x + 16}" y="${y + 288 - 46}" width="${scw - 32}" height="34" rx="17" fill="none" stroke="${GOLD}" stroke-opacity="0.4"/>
  ${text(x + scw / 2, y + 288 - 23, "تفاصيل العرض", { size: 14, fill: GOLD, weight: 600 })}`;
});
section(sTitle("عروضنا وخصوماتنا", "اختر العرض المناسب لك واستفيد من أسعارنا المخفّضة.", "عروض خاصة") + oCards, 165 + 2 * 300 + 60);

// ============ 5) الإحصائيات ============
const stats = [["5000+", "عميل سعيد", "users"], ["15+", "سنة خبرة", "scissors"], ["20+", "جائزة", "award"], ["12", "ساعة عمل يومياً", "clock"]];
let stSvg = "";
stats.forEach((s, i) => {
  const x = W / 2 + (1.5 - i) * 340;
  stSvg += `${icon(s[2], x - 14, Y + 44, 28, GOLD)}${text(x, Y + 104, s[0], { size: 34, fill: CREAM, weight: 700 })}${text(x, Y + 132, s[1], { size: 15, fill: CREAM, opacity: 0.6 })}`;
});
section(`<rect width="${W}" height="170" fill="${DARK}"/>${stSvg}`, 170);

// ============ 6) معرض الصور ============
section(`<rect width="${W}" height="330" fill="${DARK}"/>
  ${placeholder(120, Y + 30, W - 240, 210, "معرض الصور (gallery-1.jpg … gallery-6.jpg)", "image")}
  <circle cx="${W / 2 - 60}" cy="${Y + 135}" r="24" fill="${DARK}" fill-opacity="0.7" stroke="${GOLD}" stroke-opacity="0.3"/>
  ${icon("chevron-right", W / 2 - 70, Y + 125, 20, GOLD)}
  <circle cx="${W / 2 + 60}" cy="${Y + 135}" r="24" fill="${DARK}" fill-opacity="0.7" stroke="${GOLD}" stroke-opacity="0.3"/>
  ${icon("chevron-left", W / 2 + 50, Y + 125, 20, GOLD)}
  ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${W / 2 - 46 + i * 18}" y="${Y + 262}" width="${i === 0 ? 28 : 8}" height="8" rx="4" fill="${i === 0 ? GOLD : CREAM}" fill-opacity="${i === 0 ? 1 : 0.35}"/>`).join("")}
  ${[0, 1, 2, 3, 4, 5].map((i) => placeholder(120 + i * 200, Y + 285, 185, 0, "", "image")).join("")}`, 330);

// ============ 7) الفريق ============
let tCards = "";
barbers.forEach((b, i) => {
  const x = W / 2 + (1 - i) * 400, y = Y + 40;
  tCards += `<circle cx="${x}" cy="${y + 110}" r="100" fill="#141414" stroke="${GOLD}" stroke-opacity="0.3" stroke-width="2"/>
  ${text(x, y + 118, b.nameAr.slice(0, 1), { size: 64, fill: GOLD, weight: 700, opacity: 0.55 })}
  ${text(x, y + 250, b.nameAr, { size: 24, fill: CREAM, weight: 700 })}
  ${text(x, y + 278, b.roleAr, { size: 15, fill: GOLD, opacity: 0.85 })}
  ${wrap(b.bioAr, 15, 320, 2).map((l, li) => text(x, y + 306 + li * 22, l, { size: 15, fill: CREAM, opacity: 0.65 })).join("")}`;
});
section(sTitle("فريقنا", "يضم صالوننا نخبة من الحلاقين المحترفين الذين يضعون خبراتهم في خدمة مظهرك.", "نخبة من المحترفين").replace(/y="Y/, 'y="Y') + tCards, 420);

// ============ 8) الحجز ============
const field = (label, x, y, w, ph, ic) => `
  ${text(x + w - 18, y - 10, label, { size: 15, fill: CREAM, anchor: "start", opacity: 0.8 })}
  <rect x="${x}" y="${y}" width="${w}" height="52" rx="12" fill="${DARK}" stroke="${GOLD}" stroke-opacity="0.2"/>
  ${icon(ic, x + w - 22, y + 18, 18, GOLD, 1.8)}
  ${text(x + w - 52, y + 32, ph, { size: 15, fill: CREAM, anchor: "start", opacity: 0.35 })}`;
section(sTitle("حجز موعد سريع", "اختر الخدمة والوقت المناسب لك، وسنقوم بالتواصل معك لتأكيد الحجز.", "احجز موعدك") + `
  <rect x="120" y="${Y + 165}" width="${W - 240}" height="330" rx="24" fill="${DARK}" stroke="${GOLD}" stroke-opacity="0.2"/>
  ${field("الاسم", 160, Y + 225, 560, "اسمك الكامل", "user")}
  ${field("رقم الموبايل", 760, Y + 225, 560, "01xxxxxxxxx", "phone")}
  ${field("الخدمة", 160, Y + 305, 560, services[0]?.nameAr || "اختر الخدمة", "scissors")}
  ${field("الحلاق", 760, Y + 305, 560, barbers[0]?.nameAr || "اختر الحلاق", "user")}
  ${field("التاريخ", 160, Y + 385, 270, "يوم / شهر / سنة", "calendar")}
  ${field("الوقت", 460, Y + 385, 260, "--:--", "clock")}
  <rect x="760" y="${Y + 385}" width="560" height="52" rx="12" fill="${DARK}" stroke="${GOLD}" stroke-opacity="0.2"/>
  ${icon("message-square", 760 + 560 - 22, Y + 403, 18, GOLD, 1.8)}
  ${text(760 + 560 - 52, Y + 417, "ملاحظات (اختياري)", { size: 15, fill: CREAM, anchor: "start", opacity: 0.35 })}
  <rect x="160" y="${Y + 460}" width="${W - 320}" height="0" rx="0" fill="none"/>
  <rect x="${W - 160 - 260}" y="${Y + 452}" width="260" height="0" fill="none"/>`, 560);

// ============ 9) آراء العملاء ============
let tmSvg = "";
testimonials.forEach((t, i) => {
  const x = W / 2 + (1 - i) * 400, y = Y + 60;
  tmSvg += `<rect x="${x - 180}" y="${y}" width="360" height="210" rx="20" fill="${CARD}" stroke="${GOLD}" stroke-opacity="0.12"/>
  ${[0, 1, 2, 3, 4].map((s) => `<path transform="translate(${x + 120 - s * 26} ${y + 34}) scale(0.85)" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="${s < t.rating ? GOLD : CREAM}" fill-opacity="${s < t.rating ? 1 : 0.15}"/>`).join("")}
  ${wrap(t.comment, 16, 300, 3).map((l, li) => text(x, y + 96 + li * 24, l, { size: 16, fill: CREAM, opacity: 0.75 })).join("")}
  ${text(x, y + 178, t.name, { size: 16, fill: GOLD, weight: 700 })}`;
});
section(sTitle("آراء عملائنا", "ثقة عملائنا هي أكبر إنجازنا.", "آراء العملاء") + tmSvg, 340);

// ============ 10) الفوتر ============
section(`<rect width="${W}" height="280" fill="${DARK}" stroke="${GOLD}" stroke-opacity="0.2"/>
  ${icon("scissors", 120, Y + 60, 24, GOLD)}
  ${text(152, Y + 78, "SADDAM", { size: 20, fill: CREAM, weight: 700, anchor: "start" })}
  ${text(238, Y + 78, "BARBER", { size: 20, fill: GOLD, weight: 700, anchor: "start" })}
  ${wrap("صالون صدام للحلاقة يقدم تجربة حلاقة فاخرة بأيدي محترفين. نحرص على كل تفصيل لنمنحك المظهر الأنيق الذي تستحقه.", 15, 380, 3).map((l, i) => text(120, Y + 118 + i * 24, l, { size: 15, fill: CREAM, anchor: "start", opacity: 0.65 })).join("")}
  ${text(W - 120, Y + 70, "تواصل معنا", { size: 18, fill: CREAM, weight: 700, anchor: "start" })}
  ${[["phone", "01xxxxxxxxx"], ["map-pin", "العنوان: القاهرة، مصر"], ["clock", "يومياً 10ص - 10م"]].map((r, i) => `${icon(r[0], W - 150, Y + 100 + i * 34, 16, GOLD)}${text(W - 172, Y + 113 + i * 34, r[1], { size: 15, fill: CREAM, anchor: "start", opacity: 0.7 })}`).join("")}
  ${text(W / 2, Y + 250, "© 2026 SADDAM BARBER — جميع الحقوق محفوظة", { size: 14, fill: CREAM, opacity: 0.4 })}`, 280);

const TOTAL = Y;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${TOTAL}" viewBox="0 0 ${W} ${TOTAL}">
  <rect width="${W}" height="${TOTAL}" fill="${DARK}"/>
  ${parts.join("\n")}
</svg>`;

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "site-full.png"), await sharp(Buffer.from(svg)).png().toBuffer());
console.log(`✓ ${OUT}/site-full.png  (${W}x${TOTAL})`);
