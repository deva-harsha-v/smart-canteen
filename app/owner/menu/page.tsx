"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Send, UtensilsCrossed } from "lucide-react";
import { Card, Button, Input, PageSpinner, EmptyState } from "@/components/ui";
import { useToast } from "@/lib/toast";
import type { MenuItem, Stall } from "@/lib/types";

export default function OwnerMenuPage() {
  const toast = useToast();
  const [stall, setStall] = useState<Stall | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: stallData } = await supabase
      .from("stalls")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    setStall(stallData ?? null);

    if (stallData) {
      const today = new Date().toLocaleDateString("en-CA");
      const [{ data: menuItems }, { data: published }] = await Promise.all([
        supabase
          .from("menu_items")
          .select("*")
          .eq("stall_id", stallData.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("daily_menu")
          .select("item_id")
          .eq("stall_id", stallData.id)
          .eq("date", today),
      ]);

      setItems(menuItems ?? []);

      const publishedIds = new Set((published ?? []).map((r) => r.item_id));
      const selected: Record<string, boolean> = {};
      (menuItems ?? []).forEach((item) => {
        if (publishedIds.has(item.id)) selected[item.id] = true;
      });
      setSelectedItems(selected);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addItem() {
    if (!stall) return;
    const trimmedName = name.trim();
    const numericPrice = Number(price);

    if (!trimmedName || !price || Number.isNaN(numericPrice) || numericPrice <= 0) {
      toast.error("Enter a valid item name and price");
      return;
    }

    setAdding(true);
    const { data, error } = await supabase
      .from("menu_items")
      .insert({ stall_id: stall.id, name: trimmedName, price: numericPrice })
      .select()
      .single();
    setAdding(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setItems((prev) => [...prev, data]);
    setName("");
    setPrice("");
    toast.success(`${trimmedName} added to your menu`);
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedItems((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    toast.success("Item removed");
  }

  async function publishMenu() {
    if (!stall) return;
    const selected = Object.keys(selectedItems).filter((id) => selectedItems[id]);

    if (selected.length === 0) {
      toast.error("Select at least one item to publish");
      return;
    }

    const today = new Date().toLocaleDateString("en-CA");

    setPublishing(true);
    await supabase
      .from("daily_menu")
      .delete()
      .eq("stall_id", stall.id)
      .eq("date", today);

    const rows = selected.map((itemId) => ({
      stall_id: stall.id,
      item_id: itemId,
      date: today,
    }));

    const { error } = await supabase.from("daily_menu").insert(rows);
    setPublishing(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Published ${selected.length} item${selected.length === 1 ? "" : "s"} for today`);
  }

  if (loading) return <PageSpinner label="Loading your menu…" />;

  if (!stall) {
    return (
      <EmptyState
        icon={<UtensilsCrossed size={26} />}
        title="Create a stall first"
        description="Head to the dashboard to set up your stall before adding menu items."
      />
    );
  }

  return (
    <main className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-black mb-2">Manage menu</h1>
      <p className="text-ink/40 mb-8">
        Add items to your catalog, then publish the ones you&apos;re selling
        today.
      </p>

      <Card className="p-6 mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink/40 mb-4">
          Add new item
        </h2>

        <div className="grid sm:grid-cols-[1fr_140px_auto] gap-3">
          <Input
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Price (₹)"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Button onClick={addItem} loading={adding}>
            {!adding && (
              <>
                <Plus size={16} /> Add
              </>
            )}
          </Button>
        </div>
      </Card>

      {items.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed size={24} />}
          title="No menu items yet"
          description="Add your first item above to start building your catalog."
        />
      ) : (
        <>
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink/40 mb-3">
            Catalog — select today&apos;s items
          </h2>
          <div className="space-y-2.5">
            {items.map((item) => (
              <Card
                key={item.id}
                className="flex items-center justify-between px-4 py-3.5"
              >
                <label className="flex items-center gap-3.5 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={selectedItems[item.id] || false}
                    onChange={(e) =>
                      setSelectedItems({
                        ...selectedItems,
                        [item.id]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#FF724C]"
                  />
                  <span className="font-medium">{item.name}</span>
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-ink/50 text-sm">₹{item.price}</span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-ink/25 hover:text-rose-500 transition"
                    aria-label="Delete item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button onClick={publishMenu} loading={publishing} size="lg">
              {!publishing && (
                <>
                  <Send size={16} /> Publish today&apos;s menu
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
