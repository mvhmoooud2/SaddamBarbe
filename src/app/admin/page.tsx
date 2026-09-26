import type { Metadata } from "next";
import { isAuthenticated } from "@/lib/admin-auth";
import LoginForm from "@/components/admin/LoginForm";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لوحة التحكم | SADDAM BARBER",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAuthenticated())) return <LoginForm />;
  return <AdminDashboard />;
}
