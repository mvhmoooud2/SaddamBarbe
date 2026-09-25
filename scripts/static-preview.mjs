// ============================================================
//  معاينة النسخة الثابتة (مجلد out/) بنفس طريقة GitHub Pages
//
//    npm run build:pages
//    npm run preview:static
//
//  GitHub Pages بيخدم المستودع على /SaddamBarbe مش على الجذر،
//  فالسكربت ده بيعمل نفس الحاجة محلياً علشان تتأكد إن كل
//  ملفات CSS/JS/الصور بتحمّل صح قبل النشر.
// ============================================================
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "out");
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/SaddamBarbe";
const PORT = Number(process.env.PORT || process.argv[2] || 4000);
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

async function readIfExists(path) {
  try {
    return await readFile(path);
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  // أي حاجة بره مسار النشر → نوديه لمسار النشر (زي ما Pages بيعمل)
  if (!url.pathname.startsWith(`${BASE_PATH}/`) && url.pathname !== BASE_PATH) {
    res.writeHead(302, { Location: `${BASE_PATH}${url.pathname}` });
    res.end();
    return;
  }

  let relative = url.pathname.slice(BASE_PATH.length);
  if (relative === "" || relative === "/") relative = "/index.html";
  if (relative.endsWith("/")) relative += "index.html";

  const safePath = normalize(relative).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(OUT_DIR, safePath);

  let body = await readIfExists(filePath);

  // زي Pages: لو المسار ملف مش موجود نجرب .html
  if (!body && !extname(filePath)) {
    body = await readIfExists(`${filePath}.html`);
  }

  if (!body) {
    const notFound = await readIfExists(join(OUT_DIR, "404.html"));
    res.writeHead(404, { "Content-Type": MIME[".html"] });
    res.end(notFound ?? "404");
    return;
  }

  res.writeHead(200, {
    "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  res.end(body);
});

server.listen(PORT, HOST, () => {
  console.log(`معاينة النسخة الثابتة: http://localhost:${PORT}${BASE_PATH}/`);
});
