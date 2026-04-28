import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getPaddleEnvironment } from "@/lib/paddle";

export interface PremiumStatus {
  loading: boolean;
  isPremium: boolean;
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  subscriptionId: string | null;
  refresh: () => void;
}

function isAccessActive(row: { status: string; current_period_end: string | null } | null) {
  if (!row) return false;
  const end = row.current_period_end ? new Date(row.current_period_end).getTime() : null;
  const future = end === null || end > Date.now();
  if (["active", "trialing", "past_due"].includes(row.status) && future) return true;
  if (row.status === "canceled" && end !== null && end > Date.now()) return true;
  return false;
}

export function useSubscription(): PremiumStatus {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<Omit<PremiumStatus, "refresh">>({
    loading: true, isPremium: false, status: null,
    cancelAtPeriodEnd: false, currentPeriodEnd: null, subscriptionId: null,
  });

  useEffect(() => {
    if (!user) {
      setState({ loading: false, isPremium: false, status: null, cancelAtPeriodEnd: false, currentPeriodEnd: null, subscriptionId: null });
      return;
    }
    let cancelled = false;
    (async () => {
      const env = getPaddleEnvironment();
      const { data } = await supabase
        .from("user_subscriptions")
        .select("status,current_period_end,cancel_at_period_end,paddle_subscription_id")
        .eq("user_id", user.id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setState({
        loading: false,
        isPremium: isAccessActive(data),
        status: data?.status ?? null,
        cancelAtPeriodEnd: data?.cancel_at_period_end ?? false,
        currentPeriodEnd: data?.current_period_end ?? null,
        subscriptionId: data?.paddle_subscription_id ?? null,
      });
    })();

    const channel = supabase
      .channel(`user_subscriptions:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_subscriptions", filter: `user_id=eq.${user.id}` },
        () => setTick((t) => t + 1))
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [user, tick]);

  return { ...state, refresh: () => setTick((t) => t + 1) };
}

export const FREE_SUBSCRIPTION_LIMIT = 5;
