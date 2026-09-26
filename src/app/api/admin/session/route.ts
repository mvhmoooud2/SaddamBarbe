import { NextResponse } from "next/server";
import { getAdminUser, isAuthenticated } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAdminUser();
  return NextResponse.json({
    authenticated: Boolean(user),
    user,
    supabaseConnected: isSupabaseConfigured,
  });
}
