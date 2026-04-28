import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SubscriptionForm, type SubscriptionFormValue } from "@/components/SubscriptionForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/hooks/useSubscription";
import { recordPrice } from "@/lib/price-alerts";
import { toast } from "sonner";

export const Route = createFileRoute("/app/edit/$id")({
  head: () => ({
    meta: [
      { title: "Edit subscription — SubTrack" },
      { name: "description", content: "Edit a subscription." },
    ],
  }),
  component: EditSub,
});

function EditSub() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [initial, setInitial] = useState<Partial<SubscriptionFormValue> | null>(null);
  const [previousCost, setPreviousCost] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error(error?.message ?? "Not found");
        navigate({ to: "/app" });
        return;
      }
      setInitial({
        name: data.name,
        cost: Number(data.cost),
        billing_cycle: data.billing_cycle as "weekly" | "monthly" | "yearly",
        next_billing_date: data.next_billing_date,
        category: data.category,
        alerts_enabled: data.alerts_enabled ?? true,
        alert_threshold_pct: Number(data.alert_threshold_pct ?? 0),
      });
      setPreviousCost(Number(data.cost));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, navigate]);

  async function handleSubmit(v: SubscriptionFormValue) {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("subscriptions")
      .update({
        name: v.name,
        cost: v.cost,
        billing_cycle: v.billing_cycle,
        next_billing_date: v.next_billing_date,
        category: v.category,
        alerts_enabled: v.alerts_enabled,
        alert_threshold_pct: v.alert_threshold_pct,
      })
      .eq("id", id);
    if (!error && previousCost !== null && previousCost !== v.cost) {
      // Record the price change — DB trigger will compare against the
      // previous price_history row and emit a price_alert if it crosses
      // the subscription's threshold.
      await recordPrice({
        subscriptionId: id,
        userId: user.id,
        cost: v.cost,
        source: "manual_edit",
      });
    }
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Subscription updated");
    navigate({ to: "/app" });
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-4">
      <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Edit subscription</h1>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
        {loading || !initial ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />)}
          </div>
        ) : (
          <SubscriptionForm
            initial={initial}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Save changes"
            showAlerts
            alertsAvailable={isPremium}
          />
        )}
      </div>
    </main>
  );
}
