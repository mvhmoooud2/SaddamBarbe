import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkPassword,
  isAuthenticated,
  sessionToken,
} from "@/lib/admin-auth";

/** هل أنا داخل بالفعل؟ */
export async function GET() {
  return NextResponse.json({ authenticated: await isAuthenticated() });
}

/** تسجيل الدخول بكلمة السر */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = (body as { password?: unknown } | null)?.password;

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "كلمة السر غلط" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

/** تسجيل الخروج */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
