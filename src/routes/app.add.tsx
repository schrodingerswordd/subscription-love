import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SubscriptionForm, type SubscriptionFormValue } from "@/components/SubscriptionForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getServicePreset } from "@/lib/services";
import { useSubscription, FREE_SUBSCRIPTION_LIMIT } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({
  preset: z.string().optional(),
});

export const Route = createFileRoute("/app/add")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Add subscription — SubTrack" },
      { name: "description", content: "Add a new subscription to your tracker." },
    ],
  }),
  component: AddSub,
});

function AddSub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const { preset } = Route.useSearch();
  const [submitting, setSubmitting] = useState(false);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count } = await supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");
      setActiveCount(count ?? 0);
    })();
  }, [user]);

  // Gate: free users blocked at FREE_SUBSCRIPTION_LIMIT
  useEffect(() => {
    if (subLoading || activeCount === null) return;
    if (!isPremium && activeCount >= FREE_SUBSCRIPTION_LIMIT) {
      setShowUpgrade(true);
    }
  }, [subLoading, activeCount, isPremium]);

  const presetMatch = preset ? getServicePreset(preset) : undefined;
  const initial = presetMatch
    ? {
        name: presetMatch.name,
        cost: presetMatch.defaultCost,
        category: presetMatch.category,
      }
    : undefined;

  async function handleSubmit(v: SubscriptionFormValue) {
    if (!user) return;
    if (!isPremium && activeCount !== null && activeCount >= FREE_SUBSCRIPTION_LIMIT) {
      setShowUpgrade(true);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      name: v.name,
      cost: v.cost,
      billing_cycle: v.billing_cycle,
      next_billing_date: v.next_billing_date,
      category: v.category,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Subscription added");
    navigate({ to: "/app" });
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-4">
      <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Add subscription</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {presetMatch ? `Prefilled with ${presetMatch.name}'s typical price — adjust if needed.` : "Track a new recurring payment."}
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
        <SubscriptionForm
          key={preset ?? "blank"}
          initial={initial}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Add subscription"
        />
      </div>

      <UpgradePrompt
        open={showUpgrade}
        onClose={() => {
          setShowUpgrade(false);
          navigate({ to: "/app" });
        }}
        title="Free plan limit reached"
        description={`You're tracking ${FREE_SUBSCRIPTION_LIMIT} subscriptions. Upgrade to Premium for unlimited tracking.`}
      />
    </main>
  );
}
