import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Crown, ScanLine, Bell, Infinity as InfinityIcon, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — SubTrack Premium" },
      { name: "description", content: "Go Premium for unlimited subscription tracking, bank statement scanning, and price alerts. $2.99/month." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isPremium, loading } = useSubscription();
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();

  async function handleUpgrade() {
    if (!user) {
      navigate({ to: "/signup" });
      return;
    }
    try {
      await openCheckout({
        priceId: "premium_monthly",
        userId: user.id,
        customerEmail: user.email,
      });
    } catch (e) {
      toast.error((e as Error).message ?? "Could not open checkout");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Button asChild variant="ghost" size="sm">
            <Link to={user ? "/app" : "/"}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <span className="text-sm font-semibold">Pricing</span>
          <span className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Track everything. Pay almost nothing.</h1>
          <p className="mt-3 text-muted-foreground">Less than the price of one forgotten subscription.</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card-soft">
            <h2 className="text-lg font-semibold">Free</h2>
            <p className="mt-1 text-sm text-muted-foreground">For tracking the basics.</p>
            <p className="mt-5 text-4xl font-bold">$0<span className="text-base font-normal text-muted-foreground">/mo</span></p>
            <ul className="mt-6 space-y-3 text-sm">
              <Feature>Track up to 5 subscriptions</Feature>
              <Feature>Spending dashboard & charts</Feature>
              <Feature>Renewal reminders</Feature>
              <Feature>Cancel & track savings</Feature>
            </ul>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to={user ? "/app" : "/signup"}>{user ? "Go to dashboard" : "Get started"}</Link>
            </Button>
          </div>

          {/* Premium */}
          <div className="relative rounded-2xl border-2 border-primary bg-gradient-to-br from-card to-primary/5 p-6 shadow-elegant">
            <span className="absolute -top-3 left-6 rounded-full bg-gradient-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-elegant">
              <Crown className="mr-1 inline h-3 w-3" /> Recommended
            </span>
            <h2 className="text-lg font-semibold">Premium</h2>
            <p className="mt-1 text-sm text-muted-foreground">Everything, no limits.</p>
            <p className="mt-5 text-4xl font-bold">$2.99<span className="text-base font-normal text-muted-foreground">/mo</span></p>
            <ul className="mt-6 space-y-3 text-sm">
              <Feature highlight><InfinityIcon className="h-4 w-4" /> Unlimited subscriptions</Feature>
              <Feature highlight><ScanLine className="h-4 w-4" /> Bank statement scanner</Feature>
              <Feature highlight><Bell className="h-4 w-4" /> Price-change alerts</Feature>
              <Feature>Everything in Free</Feature>
            </ul>
            {isPremium ? (
              <Button disabled className="mt-6 w-full" variant="secondary">
                <Crown className="h-4 w-4" /> You're Premium
              </Button>
            ) : (
              <Button
                onClick={handleUpgrade}
                disabled={loading || checkoutLoading}
                className="mt-6 w-full bg-gradient-primary hover:opacity-90"
              >
                {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
                Upgrade for $2.99/mo
              </Button>
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">Cancel anytime. No tricks.</p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Payments handled securely by Paddle. Lovable Cloud-powered.
        </p>
      </main>
    </div>
  );
}

function Feature({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <li className="flex items-start gap-2">
      <Check className={"mt-0.5 h-4 w-4 shrink-0 " + (highlight ? "text-primary" : "text-emerald-600 dark:text-emerald-400")} />
      <span className="flex items-center gap-1.5">{children}</span>
    </li>
  );
}
