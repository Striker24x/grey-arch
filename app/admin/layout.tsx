import type { ReactNode } from "react";
import "../globals.css";
import AdminShell from "./_components/AdminShell";

export const metadata = { title: "Admin — GrayArc" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the saved admin theme before first paint to avoid a flash of the wrong mode */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('admin-theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();",
          }}
        />
      </head>
      <body className="bg-stone-50 text-graphite-900 antialiased dark:bg-paper-50 dark:text-graphite-900">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}


