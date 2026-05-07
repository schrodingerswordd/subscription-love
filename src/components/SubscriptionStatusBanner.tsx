import { AlertTriangle, Clock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { createPortalSession } from "@/server/billing.functions";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useState } from "react";
import { toast } from "sonner";

export function SubscriptionStatusBanner() {
  const { status, cancelAtPeriodEnd, currentPeriodEnd, isPremium } = useSubscription();
  const portal = useServerFn(createPortalSession);
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const { url } = await portal({ data: { environment: getPaddleEnvironment() } });
      if (url) window.open(url, "_blank", "noopener");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!isPremium) return null;

  const endDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  if (status === "past_due") {
    return (
      <div className="mx-auto mt-4 flex max-w-3xl items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div className="flex-1">
          <p className="font-semibold text-destructive">Payment failed</p>
          <p className="text-muted-foreground">Your last renewal couldn't be charged. Update your payment method to keep premium.</p>
        </div>
        <Button size="sm" variant="outline" onClick={openPortal} disabled={loading}>Update payment</Button>
      </div>
    );
  }

  if (cancelAtPeriodEnd && endDate) {
    return (
      <div className="mx-auto mt-4 flex max-w-3xl items-start gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
        <div className="flex-1">
          <p className="font-semibold">Premium ends {endDate}</p>
          <p className="text-muted-foreground">You'll lose unlimited subs, scanner, and price alerts after this date.</p>
        </div>
      </div>
    );
  }

  return null;
}
