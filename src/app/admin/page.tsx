import type { Metadata } from "next";
import { isAuthenticated } from "@/lib/admin-auth";
import AdminPageClient from "@/components/admin/AdminPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لوحة التحكم | SADDAM BARBER",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authenticated = await isAuthenticated();
  return <AdminPageClient initialAuthenticated={authenticated} />;
}
