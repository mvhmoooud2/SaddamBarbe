// ============================================================
//  توليد صور معاينة لقسم العروض (الكروت + نافذة التفاصيل)
//
//    node scripts/preview-offers.mjs
//
//  بيقرأ العروض من قاعدة البيانات وبيستخرج صور العروض الحقيقية
//  من public/images/offer-*.svg وبيبني منهم صورة معاينة.
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
  console.error("محتاج sharp عشان يشتغل السكربت:");
  console.error("  npm install --no-save sharp");
  process.exit(1);
}

const pgMod = await import(join(ROOT, "node_modules/pg/lib/index.js"));
const { Client } = pgMod.default ?? pgMod;

const FONT = "'Segoe UI', Tahoma, 'Noto Sans Arabic', 'Geeza Pro', Arial, sans-serif";
const GOLD = "#c9a227";
const GOLD_L = "#e6c86e";
const CREAM = "#f5f0e6";
const DARK = "#0f0f0f";
const CARD = "#1a1a1a";

// ---------- أيقونات lucide ----------
const iconCache = {};
function iconShapes(name) {
  if (iconCache[name]) return iconCache[name];
  const src = readFileSync(
    join(ROOT, `node_modules/lucide-react/dist/esm/icons/${name}.mjs`),
    "utf8"
  );
  const shapes = {
    paths: [...src.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]),
    circles: [...src.matchAll(/<circle([^>]*)\/>/g)].map((m) => m[1]),
  };
  iconCache[name] = shapes;
  return shapes;
}
function icon(name, x, y, size, color, sw = 2) {
  const { paths, circles } = iconShapes(name);
  const s = size / 24;
  const body = [
    ...paths.map((d) => `<path d="${d}"/>`),
    ...circles.map((a) => `<circle${a}/>`),
  ].join("");
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
}

// ---------- أدوات ----------
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const num = (v) => Number(v).toFixed(0);
const AR_MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const fmtDate = (d) => {
  const t = new Date(d);
  return `${t.getDate()} ${AR_MONTHS[t.getMonth()]} ${t.getFullYear()}`;
};
function wrap(text, fontSize, maxWidth, maxLines = 2) {
  const perLine = Math.max(8, Math.floor(maxWidth / (fontSize * 0.55)));
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > perLine && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines) break;
    } else cur = next;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length)
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -2) + "…";
  return lines;
}
function text(x, y, str, { size = 20, fill = CREAM, weight = 400, anchor = "middle", spacing = 0, opacity = 1, strike = false } = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" fill-opacity="${opacity}"${spacing ? ` letter-spacing="${spacing}"` : ""}${strike ? ` text-decoration="line-through"` : ""}>${esc(str)}</text>`;
}
const poster = (id) =>
  `data:image/svg+xml;base64,${readFileSync(join(ROOT, `public/images/offer-${id}.svg`)).toString("base64")}`;

// إطار نافذة المتصفح
function browserChrome(w, label) {
  return `
  <rect x="0" y="0" width="${w}" height="56" rx="18" fill="#161616"/>
  <rect x="0" y="38" width="${w}" height="18" fill="#161616"/>
  <circle cx="30" cy="28" r="6" fill="#ff5f57"/>
  <circle cx="52" cy="28" r="6" fill="#febc2e"/>
  <circle cx="74" cy="28" r="6" fill="#28c840"/>
  <rect x="104" y="14" width="${w - 200}" height="28" rx="14" fill="#0f0f0f"/>
  ${icon("clock", 118, 21, 14, CREAM, 2)}
  ${text(140, 33, label, { size: 14, fill: CREAM, anchor: "start", opacity: 0.55 })}`;
}

// ---------- الداتا ----------
const c = new Client({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db" });
await c.connect();
const { rows: offers } = await c.query(
  `SELECT id, title_ar AS "titleAr", description_ar AS "descriptionAr",
          details_ar AS "detailsAr", old_price AS "oldPrice", new_price AS "newPrice",
          badge_ar AS "badgeAr", valid_until AS "validUntil"
     FROM offers WHERE is_active = true ORDER BY id`
);
await c.end();
if (!offers.length) {
  console.error("مفيش عروض في الداتابيز — شغّل: npm run seed");
  process.exit(1);
}

// ================= 1) شبكة العروض =================
const CW = 400, CH = 430, GAP = 30, COLS = 3;
const rowsN = Math.ceil(offers.length / COLS);
const gridW = COLS * CW + (COLS - 1) * GAP;
const W = Math.max(1400, gridW + 140);
const startX = (W - gridW) / 2;
const startY = 300;
const H = startY + rowsN * CH + (rowsN - 1) * 36 + 80;

let cards = "";
offers.forEach((o, i) => {
  const col = i % COLS, row = Math.floor(i / COLS);
  const x = startX + col * (CW + GAP);
  const y = startY + row * (CH + 36);
  const clip = `clip${i}`;
  cards += `
  <defs>
    <clipPath id="${clip}"><rect x="${x}" y="${y}" width="${CW}" height="240" rx="16"/></clipPath>
    <linearGradient id="fade${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${CARD}" stop-opacity="0"/><stop offset="1" stop-color="${CARD}" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="16" fill="${CARD}" stroke="${GOLD}" stroke-opacity="0.2"/>
  <image href="${poster(o.id)}" x="${x}" y="${y}" width="${CW}" height="240" clip-path="url(#${clip})" preserveAspectRatio="xMidYMid slice"/>
  <rect x="${x}" y="${y + 214}" width="${CW}" height="26" fill="url(#fade${i})"/>`;
  wrap(o.descriptionAr, 19, CW - 48, 2).forEach((ln, li) => {
    cards += text(x + CW - 24, y + 292 + li * 27, ln, { size: 19, fill: CREAM, anchor: "start", opacity: 0.7 });
  });
  cards += `
  <rect x="${x + 24}" y="${y + 366}" width="${CW - 48}" height="46" rx="23" fill="none" stroke="${GOLD}" stroke-opacity="0.4"/>
  ${text(x + CW / 2, y + 395, "تفاصيل العرض", { size: 17, fill: GOLD, weight: 600 })}`;
});

const gridSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${DARK}"/>
  ${browserChrome(W, "localhost:3000  ·  SADDAM BARBER")}
  ${text(W / 2, 128, "عروض خاصة", { size: 22, fill: GOLD, weight: 600, spacing: 2 })}
  <line x1="${W / 2 - 150}" y1="120" x2="${W / 2 - 90}" y2="120" stroke="${GOLD}" stroke-width="2"/>
  <line x1="${W / 2 + 90}" y1="120" x2="${W / 2 + 150}" y2="120" stroke="${GOLD}" stroke-width="2"/>
  ${text(W / 2, 192, "عروضنا وخصوماتنا", { size: 50, fill: CREAM, weight: 700 })}
  ${text(W / 2, 240, "اختر العرض المناسب لك واستفيد من أسعارنا المخفّضة.", { size: 22, fill: CREAM, opacity: 0.7 })}
  ${text(W / 2, 272, "اضغط على صورة أي عرض لمعرفة تفاصيله الكاملة وحجز موعدك فوراً.", { size: 22, fill: CREAM, opacity: 0.7 })}
  ${cards}
</svg>`;

// ================= 2) نافذة التفاصيل =================
const o = offers[0];
const MW = 660, MH = 790;
const MX = (W - MW) / 2, MY = 100;
const cx = MX + 34, cw = MW - 68;
const right = MX + MW - 34;
const detailLines = String(o.detailsAr).split("\n").filter(Boolean);

let list = "";
detailLines.forEach((ln, i) => {
  const y = MY + 440 + i * 34;
  list += `
  <circle cx="${right - 12}" cy="${y - 6}" r="11" fill="${GOLD}" fill-opacity="0.15"/>
  ${icon("check", right - 20, y - 14, 16, GOLD_L, 3)}
  ${text(right - 34, y, ln, { size: 19, fill: CREAM, anchor: "start", opacity: 0.8 })}`;
});
const pct = Math.round(((Number(o.oldPrice) - Number(o.newPrice)) / Number(o.oldPrice)) * 100);
const save = num(Number(o.oldPrice) - Number(o.newPrice));
const untilY = MY + 440 + detailLines.length * 34 + 38;

const modalSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="980" viewBox="0 0 ${W} 980">
  <rect width="${W}" height="980" fill="${DARK}"/>
  ${browserChrome(W, "localhost:3000  ·  قسم العروض")}
  ${cards.split("</svg>")[0].replace(/^[\s\S]*?<rect x="0" y="0" width="${W}" height="${H}" fill="${DARK}"\/>/, "")}
  <rect x="0" y="56" width="${W}" height="${980 - 56}" fill="#000" fill-opacity="0.85"/>
  <rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" rx="24" fill="${CARD}" stroke="${GOLD}" stroke-opacity="0.3"/>
  ${text(right, MY + 56, o.titleAr, { size: 30, fill: CREAM, weight: 700, anchor: "start" })}
  <rect x="${right - 150}" y="${MY + 74}" width="150" height="26" rx="13" fill="${GOLD}" fill-opacity="0.15"/>
  ${text(right - 75, MY + 92, o.badgeAr, { size: 13, fill: GOLD, weight: 700 })}
  <circle cx="${MX + 44}" cy="${MY + 48}" r="20" fill="${DARK}" stroke="${GOLD}" stroke-opacity="0.3"/>
  ${icon("x", MX + 34, MY + 38, 20, CREAM, 2)}
  ${wrap(o.descriptionAr, 19, cw, 2).map((ln, i) => text(right, MY + 146 + i * 27, ln, { size: 19, fill: CREAM, anchor: "start", opacity: 0.7 })).join("")}
  <rect x="${cx}" y="${MY + 190}" width="${cw}" height="92" rx="16" fill="${DARK}" stroke="${GOLD}" stroke-opacity="0.2"/>
  ${text(right, MY + 224, "قبل العرض", { size: 14, fill: CREAM, anchor: "start", opacity: 0.4 })}
  ${text(right, MY + 258, `${num(o.oldPrice)} ج.م`, { size: 24, fill: CREAM, anchor: "start", weight: 700, opacity: 0.4, strike: true })}
  ${icon("badge-percent", MX + MW / 2 - 12, MY + 226, 24, GOLD)}
  ${text(right - 250, MY + 224, "بعد العرض", { size: 14, fill: GOLD, anchor: "start", weight: 700 })}
  ${text(right - 250, MY + 262, `${num(o.newPrice)} ج.م`, { size: 30, fill: GOLD, anchor: "start", weight: 800 })}
  <rect x="${cx + 8}" y="${MY + 224}" width="132" height="28" rx="14" fill="${GOLD}" fill-opacity="0.15"/>
  ${text(cx + 74, MY + 243, `وفّرت ${save} ج.م`, { size: 13, fill: GOLD, weight: 700 })}
  ${icon("check", right - 16, MY + 318, 20, GOLD, 2.5)}
  ${text(right - 26, MY + 336, "تفاصيل العرض", { size: 24, fill: CREAM, weight: 700, anchor: "start" })}
  ${list}
  ${icon("clock", right - 14, untilY - 24, 16, CREAM, 2)}
  ${text(right - 26, untilY - 10, `العرض ساري حتى ${fmtDate(o.validUntil)}`, { size: 15, fill: CREAM, anchor: "start", opacity: 0.5 })}
  <rect x="${cx}" y="${MY + MH - 100}" width="${cw}" height="60" rx="30" fill="${GOLD}"/>
  ${icon("calendar-check", MX + MW / 2 - 58, MY + MH - 87, 24, "#0f0f0f", 2.2)}
  ${text(MX + MW / 2 + 16, MY + MH - 60, "الحجز", { size: 26, fill: "#0f0f0f", weight: 700 })}
</svg>`;

// ---------- الحفظ ----------
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "offers-grid.png"), await sharp(Buffer.from(gridSvg)).png().toBuffer());
writeFileSync(join(OUT, "offers-modal.png"), await sharp(Buffer.from(modalSvg)).png().toBuffer());
console.log(`✓ ${OUT}/offers-grid.png`);
console.log(`✓ ${OUT}/offers-modal.png`);
console.log(`العروض: ${offers.length} | خصم ${pct}% | ${detailLines.length} نقطة تفاصيل`);
