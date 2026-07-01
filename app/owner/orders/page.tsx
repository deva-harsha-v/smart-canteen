"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ClipboardList, Check, X, ChefHat, Bell, type LucideIcon } from "lucide-react";
import { Card, Badge, Skeleton, EmptyState, Button } from "@/components/ui";
import { useToast } from "@/lib/toast";
import type { Order, OrderStatus } from "@/lib/types";

const NEXT_ACTION: Partial<Record<OrderStatus, { next: OrderStatus; label: string; icon: LucideIcon }>> = {
  pending: { next: "accepted", label: "Accept", icon: Check },
  accepted: { next: "preparing", label: "Start preparing", icon: ChefHat },
  preparing: { next: "ready", label: "Mark ready", icon: Bell },
  ready: { next: "completed", label: "Complete", icon: Check },
};

export default function OwnerOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: stallData } = await supabase
      .from("stalls")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!stallData) {
      setLoading(false);
      return;
    }

    // Single joined query — replaces the old per-order, per-item sequential
    // fetch loop (N+1 queries) with one round trip.
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(id, quantity, menu_items(name, price))")
      .eq("stall_id", stallData.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(
        data.map((o) => ({
          ...o,
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

    const channel = supabase
      .channel("owner-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    setUpdatingId(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    toast.success(`Order marked ${status}`);
  };

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto">
        <Skeleton className="h-10 w-56 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </main>
    );
  }

  const activeOrders = orders.filter(
    (o) => o.status !== "completed" && o.status !== "rejected"
  );
  const pastOrders = orders.filter(
    (o) => o.status === "completed" || o.status === "rejected"
  );

  return (
    <main className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-black mb-8">Incoming orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={26} />}
          title="No orders yet"
          description="Orders placed by students will show up here in real time."
        />
      ) : (
        <div className="space-y-8">
          {activeOrders.length > 0 && (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdate={updateStatus}
                  updating={updatingId === order.id}
                />
              ))}
            </div>
          )}

          {pastOrders.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-ink/40 hover:text-ink/70 transition mb-3 list-none flex items-center gap-2">
                <span className="group-open:rotate-90 transition-transform">▸</span>
                Past orders ({pastOrders.length})
              </summary>
              <div className="space-y-4 mt-3">
                {pastOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdate={updateStatus}
                    updating={updatingId === order.id}
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </main>
  );
}

function OrderCard({
  order,
  onUpdate,
  updating,
}: {
  order: Order;
  onUpdate: (id: string, status: OrderStatus) => void;
  updating: boolean;
}) {
  const action = NEXT_ACTION[order.status];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
          <p className="text-xs text-ink/30 mt-1">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <Badge tone={order.status}>{order.status}</Badge>
      </div>

      <div className="text-sm text-ink/60 space-y-0.5 mb-5">
        {order.items.map((item) => (
          <p key={item.id}>
            {item.name} × {item.quantity}
          </p>
        ))}
      </div>

      {action && (
        <div className="flex gap-2.5">
          <Button
            onClick={() => onUpdate(order.id, action.next)}
            loading={updating}
            size="sm"
          >
            {!updating && (
              <>
                <action.icon size={14} /> {action.label}
              </>
            )}
          </Button>
          {order.status === "pending" && (
            <Button
              onClick={() => onUpdate(order.id, "rejected")}
              variant="danger"
              size="sm"
              disabled={updating}
            >
              <X size={14} /> Reject
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
