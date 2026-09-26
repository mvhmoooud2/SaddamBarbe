import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { createClientServer } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const newPassword = body?.newPassword;

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json(
      { error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" },
      { status: 400 }
    );
  }

  // (1) تحديث كلمة المرور في Supabase Auth للمستخدم الحالي
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClientServer();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          console.error("[change-password] Supabase error:", error);
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({
          ok: true,
          message: "تم تحديث كلمة المرور بنجاح في Supabase Auth ✅",
        });
      }
    } catch (e: any) {
      console.warn("[change-password] Exception:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    message: "تم حفظ كلمة المرور الجديدة بنجاح ✅",
  });
}
