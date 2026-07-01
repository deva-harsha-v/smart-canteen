"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Trash2, ShoppingBag } from "lucide-react";
import { Card, Button, EmptyState } from "@/components/ui";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast";

export default function CartPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const { cart, totalPrice, removeItem, setQuantity, clearCart } = useCart();
  const [placing, setPlacing] = useState(false);

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    let currentUser = user;
    if (!currentUser) {
      const { data } = await supabase.auth.getUser();
      currentUser = data.user;
    }
    if (!currentUser) {
      toast.error("Please log in to place an order");
      router.push("/login");
      return;
    }

    setPlacing(true);

    const stallId = cart[0].stall_id;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({ stall_id: stallId, student_id: currentUser.id, status: "pending" })
      .select()
      .single();

    if (error || !order) {
      setPlacing(false);
      toast.error(error?.message ?? "Couldn't place order");
      return;
    }

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      item_id: item.id,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    setPlacing(false);

    if (itemsError) {
      toast.error(itemsError.message);
      return;
    }

    clearCart();
    toast.success("Order placed! Track it from the Orders tab.");
    router.push("/student/orders");
  };

  if (cart.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag size={26} />}
        title="Your cart is empty"
        description="Browse a stall and add items to get started."
        action={
          <Button onClick={() => router.push("/student/stalls")}>
            Explore stalls
          </Button>
        }
      />
    );
  }

  return (
    <main className="max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-black mb-8">Your cart</h1>

      <div className="space-y-3">
        {cart.map((item) => (
          <Card
            key={item.id}
            className="p-5 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-ink/40 text-sm mt-0.5">
                ₹{item.price} each
              </p>
              <div className="flex items-center gap-2.5 mt-2.5">
                <button
                  onClick={() => setQuantity(item, item.quantity - 1)}
                  className="w-7 h-7 rounded-full bg-ink/10 hover:bg-ink/20 transition flex items-center justify-center text-sm"
                >
                  −
                </button>
                <span className="text-sm font-semibold w-4 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => setQuantity(item, item.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-primary text-white transition flex items-center justify-center text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <p className="font-bold text-primary">
                ₹{item.price * item.quantity}
              </p>
              <button
                onClick={() => removeItem(item.id)}
                className="text-ink/30 hover:text-rose-500 transition"
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}

        <Card className="p-6">
          <div className="flex justify-between mb-5 text-lg">
            <span className="text-ink/60">Total</span>
            <span className="font-bold text-primary">₹{totalPrice}</span>
          </div>

          <Button
            onClick={placeOrder}
            loading={placing}
            className="w-full"
            size="lg"
          >
            {!placing && "Place order"}
          </Button>
        </Card>
      </div>
    </main>
  );
}
