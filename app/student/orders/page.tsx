"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Receipt, Store } from "lucide-react";
import { Card, Badge, Skeleton, EmptyState, Button } from "@/components/ui";
import { STATUS_FLOW, STATUS_LABEL, type Order, type OrderStatus } from "@/lib/types";
import { cx } from "@/components/ui";

export default function StudentOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // One query: orders joined with their stall name and line items, instead
    // of N+1 round trips per order.
    const { data, error } = await supabase
      .from("orders")
      .select(
        "*, stalls(stall_name), order_items(id, quantity, menu_items(name, price))"
      )
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(
        data.map((o) => ({
          ...o,
          stall_name: o.stalls?.stall_name,
          items: (o.order_items ?? []).map((oi: { id: string; quantity: number; menu_items: { name: string; price: number } | null }) => ({
            id: oi.id,
            quantity: oi.quantity,
            name: oi.menu_items?.name,
            price: oi.menu_items?.price,
          })),
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();

    // Real-time: live status updates without polling or manual refresh.
    const channel = supabase
      .channel("student-orders")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Receipt size={26} />}
        title="No orders yet"
        description="Once you place an order, you'll be able to track it live here."
        action={
          <Button onClick={() => router.push("/student/stalls")}>
            Browse stalls
          </Button>
        }
      />
    );
  }

  return (
    <main className="max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-black mb-8">My orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold flex items-center gap-1.5 text-ink/90">
                  <Store size={14} className="text-ink/40" />
                  {order.stall_name ?? "Order"}
                </p>
                <p className="text-xs text-ink/30 mt-1">
                  #{order.id.slice(0, 8)} ·{" "}
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <Badge tone={order.status}>{STATUS_LABEL[order.status]}</Badge>
            </div>

            <div className="text-sm text-ink/50 space-y-0.5 mb-4">
              {order.items.map((item) => (
                <p key={item.id}>
                  {item.name} × {item.quantity}
                </p>
              ))}
            </div>

            {order.status !== "rejected" && <StatusTrack status={order.status} />}
          </Card>
        ))}
      </div>
    </main>
  );
}

function StatusTrack({ status }: { status: OrderStatus }) {
  const currentIndex = STATUS_FLOW.indexOf(status);

  return (
    <div className="flex items-center">
      {STATUS_FLOW.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div
            className={cx(
              "w-2.5 h-2.5 rounded-full shrink-0 transition-colors",
              i <= currentIndex ? "bg-primary" : "bg-ink/10"
            )}
          />
          {i < STATUS_FLOW.length - 1 && (
            <div
              className={cx(
                "h-0.5 flex-1 mx-1 transition-colors",
                i < currentIndex ? "bg-primary" : "bg-ink/10"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
