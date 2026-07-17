import type { ReactNode } from "react";
import "../globals.css";
import AdminShell from "./_components/AdminShell";

export const metadata = { title: "Admin — GrayArc" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-graphite-900 antialiased">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}


