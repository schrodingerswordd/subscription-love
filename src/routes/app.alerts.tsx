import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, TrendingUp, TrendingDown, Crown, BellOff, Check, X } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceAvatar } from "@/components/ServiceAvatar";
import { formatCurrency } from "@/lib/services";

export const Route = createFileRoute("/app/alerts")({
  head: () => ({
    meta: [
      { title: "Price alerts — SubTrack" },
      { name: "description", content: "Get notified when subscription prices change." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { isPremium, loading: subLoading } = useSubscription();

  if (!subLoading && !isPremium) return <AlertsPaywall />;

  return <AlertsList />;
}

function AlertsList() {
  const { alerts, loading, markRead, dismiss, dismissAll } = usePriceAlerts();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-tight">Price alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We watch your subscriptions and ping you the moment a price changes — based on the targets you set on each one.
          </p>
        </div>
        {alerts.length > 0 && (
          <Button variant="outline" size="sm" onClick={dismissAll}>
            Dismiss all
          </Button>
        )}
      </div>

      {loading ? (
        <div className="mt-6 space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-8 text-center">
          <BellOff className="mx-auto h-8 w-8 text-muted-foreground opacity-60" />
          <p className="mt-3 text-sm font-medium">No price alerts yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            We'll show alerts here whenever a tracked subscription's price changes — from edits or bank scans.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {alerts.map((a) => {
            const up = a.change_pct > 0;
            const Icon = up ? TrendingUp : TrendingDown;
            const tone = up
              ? "text-destructive bg-destructive/10 dark:bg-destructive/20"
              : "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40";
            const diff = a.new_cost - a.old_cost;
            return (
              <li key={a.id}
                className={"rounded-2xl border bg-card p-4 shadow-card-soft transition " +
                  (a.status === "unread" ? "border-primary/40 ring-1 ring-primary/20" : "border-border")}>
                <div className="flex items-start gap-3">
                  <ServiceAvatar name={a.subscription_name ?? "?"} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{a.subscription_name ?? "Subscription"}</p>
                      <Badge variant="outline" className={"gap-1 text-xs " + tone}>
                        <Icon className="h-3 w-3" /> {up ? "+" : ""}{a.change_pct}%
                      </Badge>
                      {a.status === "unread" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="line-through">{formatCurrency(a.old_cost)}</span>
                      {" → "}
                      <span className="font-semibold text-foreground tabular-nums">{formatCurrency(a.new_cost)}</span>
                      <span className={up ? "ml-2 text-destructive" : "ml-2 text-emerald-600"}>
                        ({up ? "+" : ""}{formatCurrency(diff)})
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {sourceLabel(a.source)} · {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {a.status === "unread" && (
                      <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={() => markRead(a.id)}>
                        <Check className="h-3.5 w-3.5" /> Read
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={() => dismiss(a.id)}>
                      <X className="h-3.5 w-3.5" /> Dismiss
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                    <Link to="/app/edit/$id" params={{ id: a.subscription_id }}>Adjust threshold</Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

function sourceLabel(source: string) {
  switch (source) {
    case "scan": return "Detected via bank scan";
    case "manual_edit": return "From your edit";
    case "initial": return "Initial price";
    default: return source;
  }
}

function AlertsPaywall() {
  return (
    <main className="mx-auto max-w-md px-4 pt-4">
      <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="mt-8 rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-card to-primary/5 p-6 text-center shadow-elegant">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-elegant">
          <Crown className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Price alerts are a Premium feature</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Set a target on any subscription and we'll alert you the moment a price increases — from edits, renewals, or bank scans.
        </p>
        <Button asChild className="mt-6 w-full bg-gradient-primary hover:opacity-90">
          <Link to="/pricing">
            <Crown className="h-4 w-4" /> Upgrade for $2.99/mo
          </Link>
        </Button>
      </div>
    </main>
  );
}
