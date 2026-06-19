import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import { ClipboardList, FileText, FolderKanban, Home, Library, Settings, ShieldCheck } from "lucide-react";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "QuickMed Mission Control",
  description: "Local operating dashboard for QuickMed workstreams, matters, tasks, evidence, and build specs."
};

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/tasks", label: "Tasks", icon: FolderKanban },
  { href: "/matters", label: "Matters", icon: ShieldCheck },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/drafts", label: "Drafts", icon: Library },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
          <aside className="border-b border-line bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3 px-4 py-4 lg:px-5 lg:py-6">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-brand text-white">
                <ClipboardList size={20} />
              </div>
              <div>
                <div className="text-sm font-bold">QuickMed</div>
                <div className="text-xs font-semibold text-ink/55">Mission Control</div>
              </div>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-field hover:text-ink lg:w-full"
                  )}
                >
                  <item.icon size={17} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
        </div>
      </body>
    </html>
  );
}
