"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (data?.user?.email) {
          setUser({ email: data.user.email });
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (!mounted) {
    return (
      <nav className="site-nav">
        <div className="site-nav-inner site-nav-placeholder" />
      </nav>
    );
  }

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <div className="site-nav-left">
          <Link
            href="/"
            className="site-brand"
          >
            Temicide
          </Link>
          <Link
            href="/"
            className={`nav-link ${isActive("/") && pathname !== "/loglife" ? "nav-link-active" : ""}`}
          >
            Knowledge
          </Link>
          <Link
            href="/loglife"
            className={`nav-link ${isActive("/loglife") ? "nav-link-active" : ""}`}
          >
            LogLife
          </Link>
        </div>
        <div className="site-nav-right">
          {user ? (
            <>
              <span className="site-nav-email">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="site-nav-action"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="site-nav-action"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="btn-primary site-nav-register"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
