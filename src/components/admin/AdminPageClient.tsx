"use client";

import { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import AdminDashboard from "./AdminDashboard";

export default function AdminPageClient({
  initialAuthenticated = false,
}: {
  initialAuthenticated?: boolean;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 1. فحص الـ localStorage أولاً (يعمل حتى لو الـ Cookies محجوبة في المعاينة)
    const localAuth = localStorage.getItem("sb_admin_session") === "true";
    if (localAuth) {
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    // 2. فحص السيرفر
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          localStorage.setItem("sb_admin_session", "true");
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, []);

  function handleLoginSuccess() {
    localStorage.setItem("sb_admin_session", "true");
    setIsAuthenticated(true);
  }

  function handleLogout() {
    localStorage.removeItem("sb_admin_session");
    setIsAuthenticated(false);
  }

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}
