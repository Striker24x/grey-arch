"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ArchMark from "@/components/ArchMark";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/projects", label: "Projects", icon: "◫" },
  { href: "/admin/categories", label: "Categories", icon: "⊟" },
  { href: "/admin/gallery", label: "Gallery", icon: "▦" },
  { href: "/admin/team", label: "Team", icon: "◑" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // Login page has no shell
  if (pathname === "/admin/login") return <>{children}</>;

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-stone-200 bg-white">
        <div className="flex h-14 items-center gap-2 border-b border-stone-200 px-4">
          <ArchMark className="h-6 w-7 text-graphite-900" />
          <span className="text-sm font-semibold tracking-wide text-graphite-900">Admin</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-stone-100 font-medium text-graphite-900"
                    : "text-stone-500 hover:bg-stone-50:bg-neutral-700 hover:text-graphite-900:text-stone-100"
                }`}
              >
                <span className="w-4 text-center text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-200 p-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-stone-500 transition-colors hover:bg-stone-50:bg-neutral-700 hover:text-graphite-900:text-stone-100 disabled:opacity-50"
          >
            <span className="w-4 text-center">→</span>
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="ml-56 flex-1 min-h-screen bg-stone-50">
        {children}
      </div>
    </div>
  );
}
