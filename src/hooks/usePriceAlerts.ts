import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { createRealtimeChannel, realtimeTopic } from "@/lib/realtime";
import { readCache, writeCache } from "@/lib/offline-cache";

export interface PriceAlert {
  id: string;
  subscription_id: string;
  old_cost: number;
  new_cost: number;
  change_pct: number;
  source: string;
  status: "unread" | "read" | "dismissed";
  created_at: string;
  subscription_name?: string;
}

export function usePriceAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // Fetch alerts whenever user changes or a refresh is requested.
  useEffect(() => {
    if (!user) { setAlerts([]); setLoading(false); return; }
    let cancelled = false;

    // Hydrate from cache first for instant render.
    readCache<PriceAlert[]>("price_alerts", user.id).then((cached) => {
      if (cancelled || !cached) return;
      setAlerts(cached.data);
      setLoading(false);
    });

    (async () => {
      const { data, error } = await supabase
        .from("price_alerts")
        .select("id,subscription_id,old_cost,new_cost,change_pct,source,status,created_at,subscriptions(name)")
        .neq("status", "dismissed")
        .order("created_at", { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (error) {
        // Network failure — keep cached alerts on screen.
        setLoading(false);
        return;
      }
      type Row = Omit<PriceAlert, "subscription_name"> & { subscriptions: { name: string } | null };
      const rows = (data ?? []) as unknown as Row[];
      const mapped = rows.map((r) => ({
        id: r.id,
        subscription_id: r.subscription_id,
        old_cost: Number(r.old_cost),
        new_cost: Number(r.new_cost),
        change_pct: Number(r.change_pct),
        source: r.source,
        status: r.status,
        created_at: r.created_at,
        subscription_name: r.subscriptions?.name,
      }));
      setAlerts(mapped);
      setLoading(false);
      writeCache("price_alerts", user.id, mapped);
    })();
    return () => { cancelled = true; };
  }, [user, tick]);

  // Subscribe to realtime once per user. Cleanup always removes the
  // channel on unmount or user change so listeners never accumulate.
  useEffect(() => {
    if (!user) return;
    const ch = createRealtimeChannel(realtimeTopic("price_alerts", user.id))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "price_alerts", filter: `user_id=eq.${user.id}` },
        () => setTick((t) => t + 1),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  async function markRead(id: string) {
    await supabase.from("price_alerts").update({ status: "read" }).eq("id", id);
    setTick((t) => t + 1);
  }
  async function dismiss(id: string) {
    await supabase.from("price_alerts").update({ status: "dismissed" }).eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }
  async function dismissAll() {
    if (!user) return;
    await supabase.from("price_alerts").update({ status: "dismissed" }).eq("user_id", user.id).neq("status", "dismissed");
    setAlerts([]);
  }

  const unreadCount = alerts.filter((a) => a.status === "unread").length;
  return { alerts, unreadCount, loading, markRead, dismiss, dismissAll, refresh: () => setTick((t) => t + 1) };
}
