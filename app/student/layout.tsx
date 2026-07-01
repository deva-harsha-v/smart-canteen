"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Compass, Receipt, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { cx } from "@/components/ui";

const NAV = [
  { href: "/student/stalls", label: "Explore", icon: Compass },
  { href: "/student/orders", label: "Orders", icon: Receipt },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { totalItems } = useCart();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 flex justify-between items-center px-5 md:px-8 py-3.5 bg-background/80 backdrop-blur-xl border-b border-ink/10">
        <Link href="/student/stalls" className="text-xl font-black text-primary tracking-tight">
          eats.
        </Link>

        <div className="flex gap-1 md:gap-2 items-center text-sm">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cx(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition",
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

          <Link
            href="/student/cart"
            className="relative flex items-center gap-2 bg-primary px-4 py-2.5 rounded-xl text-white font-semibold hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20 ml-1"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-primary text-[11px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

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
