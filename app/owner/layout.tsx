"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, ClipboardList, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cx } from "@/components/ui";

const NAV = [
  { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/owner/orders", label: "Orders", icon: ClipboardList },
];

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 flex justify-between items-center px-5 md:px-8 py-3.5 bg-background/80 backdrop-blur-xl border-b border-ink/10">
        <Link href="/owner/dashboard" className="text-lg font-black text-primary tracking-tight">
          Smart Canteen <span className="text-ink/30 font-medium text-sm">/ owner</span>
        </Link>

        <div className="flex gap-1 items-center text-sm">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cx(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition",
                  active
                    ? "bg-ink/10 text-ink"
                    : "text-ink/50 hover:text-ink hover:bg-ink/5"
                )}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-ink/40 hover:text-ink hover:bg-ink/5 transition ml-1"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <main className="flex-1 px-5 md:px-10 py-8 bg-background">
        {children}
      </main>
    </>
  );
}
