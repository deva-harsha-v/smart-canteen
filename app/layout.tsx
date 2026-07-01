import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/lib/toast";

export const metadata: Metadata = {
  title: "Smart Canteen — Skip the Queue",
  description:
    "Order from campus food stalls in seconds. Real-time order tracking, live menus, zero queues.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-ink antialiased font-sans">
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <div className="min-h-screen flex flex-col">
                <Suspense fallback={null}>{children}</Suspense>
              </div>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
