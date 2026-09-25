#!/bin/bash
# ============================================================
#  تشغيل بيئة التطوير كاملة بأمر واحد
#
#    ./scripts/dev-up.sh
#    (أو: npm run dev:up)
#
#  السكربت بيعمل كل حاجة لوحده:
#    1. تثبيت حاجات المشروع (لو node_modules مش موجود)
#    2. تثبيت PostgreSQL محلي (لو مش موجود)
#    3. تشغيل قاعدة البيانات وإنشاء app_db
#    4. بناء الجداول + زرع البيانات + توليد صور العروض
#    5. تشغيل الموقع على http://localhost:3000
#
#  آمن لو اتنفّذ أكتر من مرة (idempotent)
# ============================================================
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PG_DIR="$ROOT/.pg-local"
PG_BIN="$PG_DIR/node_modules/@embedded-postgres/linux-x64/native/bin"
PGDATA="$PG_DIR/data"
DB_NAME="app_db"
PG_SUPER_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres"

log() { printf '\n\033[1;33m==> %s\033[0m\n' "$1"; }

# ---------- 1) حاجات المشروع ----------
log "[1/6] تثبيت حاجات المشروع"
if [ ! -d node_modules ] || [ ! -f node_modules/.bin/next ]; then
  npm install --no-audit --no-fund
else
  echo "   node_modules موجود"
fi

# ---------- 2) PostgreSQL محلي ----------
log "[2/6] تجهيز PostgreSQL محلي"
mkdir -p "$PG_DIR"
if [ ! -f "$PG_DIR/package.json" ]; then
  echo '{"name":"saddam-barber-pg-local","private":true,"version":"1.0.0"}' > "$PG_DIR/package.json"
fi
if [ ! -f "$PG_BIN/pg_ctl" ]; then
  echo "   تثبيت ملفات PostgreSQL..."
  (cd "$PG_DIR" && npm install @embedded-postgres/linux-x64 --no-audit --no-fund)
else
  echo "   ملفات PostgreSQL موجودة"
fi

# ---------- 3) تشغيل قاعدة البيانات ----------
log "[3/6] تشغيل قاعدة البيانات"
if "$PG_BIN/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1; then
  echo "   PostgreSQL شغال بالفعل"
else
  if [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "   تهيئة مجلد البيانات..."
    "$PG_BIN/initdb" -D "$PGDATA" -U postgres --auth=trust --encoding=UTF8 \
      > "$PG_DIR/initdb.log" 2>&1
  fi
  "$PG_BIN/pg_ctl" -D "$PGDATA" \
    -o "-p 5432 -h 127.0.0.1 -c listen_addresses=127.0.0.1" \
    -l "$PG_DIR/postgres.log" -w start
  echo "   PostgreSQL اشتغل"
fi

# إنشاء الداتابيز لو مش موجودة
node -e "
const { Client } = require('$ROOT/node_modules/pg');
(async () => {
  const c = new Client({ connectionString: '$PG_SUPER_URL' });
  await c.connect();
  const r = await c.query(\"SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'\");
  if (r.rowCount === 0) {
    await c.query('CREATE DATABASE $DB_NAME');
    console.log('   اتعملت الداتابيز $DB_NAME');
  }
  await c.end();
})().catch((e) => { console.error('   فشل إنشاء الداتابيز:', e.message); process.exit(1); });
"

# ---------- 4) الجداول والبيانات ----------
log "[4/6] بناء الجداول وزرع البيانات"
npx drizzle-kit push --force >/dev/null 2>&1 && echo "   الجداول جاهزة"
npm run seed --silent
npm run images --silent

# ---------- 5) فحص سريع ----------
log "[5/6] فحص سريع"
node -e "
const { Client } = require('$ROOT/node_modules/pg');
(async () => {
  const c = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:5432/$DB_NAME' });
  await c.connect();
  const o = await c.query('SELECT count(*)::int AS n FROM offers');
  const s = await c.query('SELECT count(*)::int AS n FROM services');
  console.log('   العروض:', o.rows[0].n, '| الخدمات:', s.rows[0].n);
  await c.end();
})().catch((e) => { console.error('   فشل الفحص:', e.message); process.exit(1); });
"

# ---------- 6) تشغيل الموقع ----------
log "[6/6] تشغيل الموقع"
echo "   http://localhost:3000"
echo ""
exec npm run dev
