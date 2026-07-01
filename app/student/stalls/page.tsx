"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Search, Store, ArrowRight } from "lucide-react";
import { Card, Badge, Skeleton, EmptyState, Input } from "@/components/ui";
import type { Stall } from "@/lib/types";

export default function StudentStallsPage() {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchStalls = async () => {
      const { data, error } = await supabase
        .from("stalls")
        .select("*")
        .eq("status", "open")
        .order("stall_name", { ascending: true });

      if (!error) setStalls(data ?? []);
      setLoading(false);
    };

    fetchStalls();
  }, []);

  const filtered = useMemo(
    () =>
      stalls.filter((s) =>
        s.stall_name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [stalls, query]
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black">
            What are you craving today?
          </h1>
          <p className="text-ink/40 mt-1.5">
            {loading ? "Loading open stalls…" : `${filtered.length} stall${filtered.length === 1 ? "" : "s"} open right now`}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30"
          />
          <Input
            placeholder="Search stalls…"
            className="pl-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Store size={26} />}
          title={stalls.length === 0 ? "No stalls open right now" : "No matches"}
          description={
            stalls.length === 0
              ? "Check back soon — vendors open their stalls throughout the day."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {filtered.map((stall) => (
            <Link key={stall.id} href={`/student/stall/${stall.id}`}>
              <Card className="p-6 h-full hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Store size={20} />
                  </div>
                  <Badge tone="open">● Open</Badge>
                </div>

                <h2 className="text-lg font-bold group-hover:text-primary transition-colors">
                  {stall.stall_name}
                </h2>

                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-4 opacity-80 group-hover:opacity-100 group-hover:gap-2.5 transition-all">
                  View menu <ArrowRight size={14} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
