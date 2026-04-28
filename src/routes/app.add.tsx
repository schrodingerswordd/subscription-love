import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SubscriptionForm, type SubscriptionFormValue } from "@/components/SubscriptionForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/app/add")({
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
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(v: SubscriptionFormValue) {
    if (!user) return;
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
      <p className="mt-1 text-sm text-muted-foreground">Track a new recurring payment.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
        <SubscriptionForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Add subscription" />
      </div>
    </main>
  );
}
