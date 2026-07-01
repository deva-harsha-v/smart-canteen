"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Store, Power, Clock, Receipt, IndianRupee } from "lucide-react";
import { Card, Button, Input, PageSpinner, Badge } from "@/components/ui";
import { useToast } from "@/lib/toast";
import type { Stall } from "@/lib/types";

interface Stats {
  pendingCount: number;
  todayOrders: number;
  todayRevenue: number;
}

export default function OwnerDashboard() {
  const toast = useToast();
  const [stall, setStall] = useState<Stall | null>(null);
  const [stallName, setStallName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [stats, setStats] = useState<Stats>({ pendingCount: 0, todayOrders: 0, todayRevenue: 0 });

  const fetchStall = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("stalls")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    setStall(data ?? null);
    if (data) await loadStats(data.id);
    setLoading(false);
  };

  const loadStats = async (stallId: string) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("orders")
      .select("status, order_items(quantity, menu_items(price))")
      .eq("stall_id", stallId)
      .gte("created_at", startOfDay.toISOString());

    const orders = data ?? [];
    type StatRow = {
      status: string;
      order_items: { quantity: number; menu_items: { price: number } | null }[] | null;
    };
    const rows = orders as unknown as StatRow[];
    const pendingCount = rows.filter((o) => o.status === "pending").length;
    const todayRevenue = rows
      .filter((o) => o.status === "completed")
      .reduce(
        (sum, o) =>
          sum +
          (o.order_items ?? []).reduce(
            (s, oi) => s + (oi.menu_items?.price ?? 0) * oi.quantity,
            0
          ),
        0
      );

    setStats({ pendingCount, todayOrders: orders.length, todayRevenue });
  };

  useEffect(() => {
    fetchStall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createStall = async () => {
    if (!stallName.trim()) {
      toast.error("Enter a stall name");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setCreating(true);
    const { data, error } = await supabase
      .from("stalls")
      .insert({ owner_id: user.id, stall_name: stallName.trim(), status: "closed" })
      .select()
      .single();
    setCreating(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Stall created — open it when you're ready to take orders");
    setStall(data);
  };

  const toggleStatus = async () => {
    if (!stall) return;
    const newStatus = stall.status === "open" ? "closed" : "open";

    setToggling(true);
    const { error } = await supabase
      .from("stalls")
      .update({ status: newStatus })
      .eq("id", stall.id);
    setToggling(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setStall({ ...stall, status: newStatus });
    toast.success(newStatus === "open" ? "Stall is now open" : "Stall is now closed");
  };

  if (loading) return <PageSpinner label="Loading your stall…" />;

  if (!stall) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center">
        <Card className="p-8 w-full max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
            <Store size={22} />
          </div>
          <h1 className="text-2xl font-black mb-2">Create your stall</h1>
          <p className="text-ink/40 text-sm mb-6">
            Give your stall a name — you can publish a menu and start taking
            orders right after.
          </p>

          <Input
            placeholder="e.g. Campus Grill"
            value={stallName}
            onChange={(e) => setStallName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createStall()}
          />

          <Button onClick={createStall} loading={creating} className="w-full mt-4">
            {!creating && "Create stall"}
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black">{stall.stall_name}</h1>
          <p className="text-ink/40 mt-1">Owner dashboard</p>
        </div>
        <Button
          onClick={toggleStatus}
          loading={toggling}
          variant={stall.status === "open" ? "danger" : "primary"}
        >
          {!toggling && (
            <>
              <Power size={16} />
              {stall.status === "open" ? "Close stall" : "Open stall"}
            </>
          )}
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-ink/40 text-sm mb-2">
            <Store size={14} /> Status
          </div>
          <Badge tone={stall.status}>{stall.status === "open" ? "● Open" : "Closed"}</Badge>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-ink/40 text-sm mb-2">
            <Clock size={14} /> Pending orders
          </div>
          <p className="text-2xl font-black">{stats.pendingCount}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-ink/40 text-sm mb-2">
            <Receipt size={14} /> Orders today
          </div>
          <p className="text-2xl font-black">{stats.todayOrders}</p>
        </Card>
      </div>

      <Card className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <IndianRupee size={18} />
        </div>
        <div>
          <p className="text-ink/40 text-sm">Revenue today (completed orders)</p>
          <p className="text-xl font-black">₹{stats.todayRevenue}</p>
        </div>
      </Card>
    </main>
  );
}
