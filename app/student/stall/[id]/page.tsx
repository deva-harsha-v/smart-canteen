"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Card, Skeleton, EmptyState, Button } from "@/components/ui";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast";
import type { MenuItem, Stall } from "@/lib/types";

export default function StallMenuPage() {
  const params = useParams();
  const router = useRouter();
  const stallId = params.id as string;
  const toast = useToast();
  const { getQuantity, setQuantity, totalItems, totalPrice, cart } = useCart();

  const [stall, setStall] = useState<Stall | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stallId]);

  const fetchMenu = async () => {
    setLoading(true);
    const today = new Date().toLocaleDateString("en-CA");

    const [{ data: stallData }, { data: menuRows, error }] = await Promise.all([
      supabase.from("stalls").select("*").eq("id", stallId).single(),
      // Single joined query instead of fetching item ids then re-querying
      // menu_items separately — cuts a network round trip per page load.
      supabase
        .from("daily_menu")
        .select("menu_items(*)")
        .eq("stall_id", stallId)
        .eq("date", today),
    ]);

    setStall(stallData ?? null);

    if (error) {
      toast.error("Couldn't load today's menu");
      setItems([]);
      setLoading(false);
      return;
    }

    const flattened = (menuRows ?? [])
      .map((row) => row.menu_items)
      .filter(Boolean) as unknown as MenuItem[];

    setItems(flattened);
    setLoading(false);
  };

  const cartBelongsToOtherStall =
    cart.length > 0 && cart[0].stall_id !== stallId;

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-1 py-2">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-80 mb-10" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black">
          {stall?.stall_name ?? "Today's Menu"}
        </h1>
        <p className="text-ink/40 mt-1.5">
          Pick your favorites and order instantly
        </p>
      </div>

      {cartBelongsToOtherStall && (
        <div className="mb-6 text-sm bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl">
          Your cart has items from another stall. Adding from here will
          replace it.
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed size={26} />}
          title="No menu published today"
          description="This stall hasn't published a menu yet. Check back later."
        />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => {
            const quantity = getQuantity(item.id);
            return (
              <Card
                key={item.id}
                className="p-5 flex justify-between items-center hover:border-primary/30 transition-colors"
              >
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  {item.description && (
                    <p className="text-sm text-ink/40 mt-0.5">
                      {item.description}
                    </p>
                  )}
                  <p className="text-primary font-bold mt-1.5">
                    ₹{item.price}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {quantity > 0 && (
                    <button
                      onClick={() =>
                        setQuantity(
                          { id: item.id, name: item.name, price: item.price, stall_id: stallId, stall_name: stall?.stall_name },
                          quantity - 1
                        )
                      }
                      className="w-9 h-9 rounded-full bg-ink/10 hover:bg-ink/20 flex items-center justify-center transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                  )}

                  {quantity > 0 && (
                    <span className="w-5 text-center font-bold">
                      {quantity}
                    </span>
                  )}

                  <button
                    onClick={() =>
                      setQuantity(
                        { id: item.id, name: item.name, price: item.price, stall_id: stallId, stall_name: stall?.stall_name },
                        quantity + 1
                      )
                    }
                    className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center hover:-translate-y-0.5 transition-transform"
                    aria-label="Add item"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {totalItems > 0 && !cartBelongsToOtherStall && (
        <div className="fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur-xl border-t border-ink/10 p-4 z-30">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-sm text-ink/50">
                {totalItems} item{totalItems === 1 ? "" : "s"} · ₹{totalPrice}
              </p>
            </div>
            <Button onClick={() => router.push("/student/cart")} size="lg">
              <ShoppingBag size={16} /> View cart
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
