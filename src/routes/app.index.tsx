import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { readCache, writeCache } from "@/lib/offline-cache";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, toMonthly } from "@/lib/services";
import { toast } from "sonner";
import { VaultDashboard } from "@/components/vault/VaultDashboard";

interface Subscription {
  id: string;
  name: string;
  cost: number;
  billing_cycle: string;
  next_billing_date: string;
  category: string;
  created_at: string;
  status: "active" | "cancelled";
  cancelled_at: string | null;
  shared_with_count: number;
}

const dashSearchSchema = (s: Record<string, unknown>) => ({
  upgraded: s.upgraded === "1" || s.upgraded === 1 ? true : undefined,
});

export const Route = createFileRoute("/app/")({
  validateSearch: dashSearchSchema,
  head: () => ({
    meta: [
      { title: "Vault Hub — The Knowledge Vault" },
      { name: "description", content: "Access your survival archive and manage allocations." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { upgraded } = Route.useSearch();

  useEffect(() => {
    if (upgraded) {
      toast.success("CLEARANCE UPGRADED", { description: "Elite Sovereign status active." });
      const url = new URL(window.location.href);
      url.searchParams.delete("upgraded");
      window.history.replaceState({}, "", url.toString());
    }
  }, [upgraded]);

  useEffect(() => {
    if (!user) return;
    
    readCache<Subscription[]>("subscriptions", user.id).then((cached) => {
      if (cached) {
        setSubs(cached.data);
        setLoading(false);
      }
    });

    async function load() {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error) {
        const rows = (data ?? []) as Subscription[];
        setSubs(rows);
        writeCache("subscriptions", user!.id, rows);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleCancel(s: Subscription) {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", s.id)
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    setSubs((prev) => prev.map((x) => (x.id === s.id ? (data as Subscription) : x)));
    toast.success(`ALLOCATION TERMINATED: ${s.name}`);
  }

  async function handleReactivate(s: Subscription) {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({ status: "active", cancelled_at: null })
      .eq("id", s.id)
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    setSubs((prev) => prev.map((x) => (x.id === s.id ? (data as Subscription) : x)));
    toast.success(`ALLOCATION RESTORED: ${s.name}`);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setSubs((prev) => prev.filter((s) => s.id !== id));
    toast.success("RECORD PURGED");
  }

  return (
    <VaultDashboard 
      subs={subs} 
      loading={loading} 
      onCancel={handleCancel}
      onReactivate={handleReactivate}
      onDelete={handleDelete}
    />
  );
}
