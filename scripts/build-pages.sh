#!/bin/bash
# ============================================================
#  بناء نسخة GitHub Pages محلياً (نفس خطوات الـ workflow)
#
#    npm run build:pages
#
#  النسخة الثابتة مالهاش API routes ولا قاعدة بيانات،
#  فالسكربت بيبعد مجلد src/app/api مؤقتاً ويرجّعه بعد البناء.
#  الناتج في مجلد out/ — تقدر تعاينه بـ: npm run preview:static
# ============================================================
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export STATIC_EXPORT=1
export NEXT_PUBLIC_BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-/SaddamBarbe}"

BACKUP_DIR="$(mktemp -d)"
MOVED_API=0

restore() {
  if [ "$MOVED_API" = "1" ] && [ -d "$BACKUP_DIR/api" ]; then
    rm -rf src/app/api
    mv "$BACKUP_DIR/api" src/app/api
  fi
  rm -rf "$BACKUP_DIR"
}
trap restore EXIT

# API routes مش مدعومة في التصدير الثابت → بنبعدها وقت البناء بس
if [ -d src/app/api ]; then
  mv src/app/api "$BACKUP_DIR/api"
  MOVED_API=1
fi

npx next build

echo ""
echo "✅ النسخة الثابتة جاهزة في: out/"
echo "   للمعاينة بنفس مسار GitHub Pages:  npm run preview:static"
echo "   المسار المتوقع: http://localhost:4000${NEXT_PUBLIC_BASE_PATH}/"
