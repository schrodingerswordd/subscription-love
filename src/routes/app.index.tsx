import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Calendar, Sparkles, Bell, Ban, RotateCcw, PiggyBank, ScanLine, Crown, TrendingUp } from "lucide-react";
import { useSubscription, FREE_SUBSCRIPTION_LIMIT } from "@/hooks/useSubscription";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ServiceAvatar } from "@/components/ServiceAvatar";
import { QuickAddRow } from "@/components/QuickAddRow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, getCategoryMeta, toMonthly } from "@/lib/services";
import { toast } from "sonner";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

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
}

const REMINDER_DAYS = 3;

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SubTrack" },
      { name: "description", content: "Your subscription dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { alerts: priceAlerts, unreadCount: priceAlertsUnread } = usePriceAlerts();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "cancelled">("active");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) toast.error(error.message);
      else setSubs((data ?? []) as Subscription[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const activeSubs = useMemo(() => subs.filter((s) => s.status === "active"), [subs]);
  const cancelledSubs = useMemo(() => subs.filter((s) => s.status === "cancelled"), [subs]);

  const totalMonthly = useMemo(
    () => activeSubs.reduce((sum, s) => sum + toMonthly(Number(s.cost), s.billing_cycle), 0),
    [activeSubs],
  );
  const yearly = totalMonthly * 12;

  // Monthly savings = sum of monthly equivalents for cancelled subs
  const monthlySavings = useMemo(
    () => cancelledSubs.reduce((sum, s) => sum + toMonthly(Number(s.cost), s.billing_cycle), 0),
    [cancelledSubs],
  );
  // Total saved since cancellation date
  const totalSaved = useMemo(() => {
    return cancelledSubs.reduce((sum, s) => {
      if (!s.cancelled_at) return sum;
      const monthsSince = Math.max(
        0,
        (Date.now() - new Date(s.cancelled_at).getTime()) / (1000 * 60 * 60 * 24 * 30.4375),
      );
      return sum + toMonthly(Number(s.cost), s.billing_cycle) * monthsSince;
    }, 0);
  }, [cancelledSubs]);

  // Renewals due within REMINDER_DAYS (active only)
  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return activeSubs
      .map((s) => {
        const due = new Date(s.next_billing_date + "T00:00:00");
        const days = Math.ceil((due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
        return { sub: s, days };
      })
      .filter(({ days }) => days >= 0 && days <= REMINDER_DAYS)
      .sort((a, b) => a.days - b.days);
  }, [activeSubs]);

  const upcomingSub = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...activeSubs]
      .filter((s) => s.next_billing_date >= today)
      .sort((a, b) => a.next_billing_date.localeCompare(b.next_billing_date))[0];
  }, [activeSubs]);

  const chartData = useMemo(() => {
    const months: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-US", { month: "short" });
      const cutoff = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const value = subs
        .filter((s) => new Date(s.created_at) < cutoff)
        .filter((s) => s.status === "active" || (s.cancelled_at && new Date(s.cancelled_at) >= cutoff))
        .reduce((sum, s) => sum + toMonthly(Number(s.cost), s.billing_cycle), 0);
      months.push({ label, value: Math.round(value * 100) / 100 });
    }
    return months;
  }, [subs]);

  async function handleDelete(id: string) {
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setSubs((prev) => prev.filter((s) => s.id !== id));
    toast.success("Subscription deleted");
    setDeleteId(null);
  }

  async function handleCancel(s: Subscription) {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", s.id)
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    setSubs((prev) => prev.map((x) => (x.id === s.id ? (data as Subscription) : x)));
    toast.success(`${s.name} cancelled — saving ${formatCurrency(toMonthly(Number(s.cost), s.billing_cycle))}/mo`);
  }

  async function handleReactivate(s: Subscription) {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({ status: "active" })
      .eq("id", s.id)
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    setSubs((prev) => prev.map((x) => (x.id === s.id ? (data as Subscription) : x)));
    toast.success(`${s.name} reactivated`);
  }

  const visibleSubs = tab === "active" ? activeSubs : cancelledSubs;

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 pb-24">
      {/* Total monthly cost */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant sm:p-8">
        <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <p className="text-xs font-medium uppercase tracking-wider opacity-80">Total monthly spend</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tight tabular-nums sm:text-6xl">
            {formatCurrency(totalMonthly)}
          </span>
          <span className="text-base opacity-80">/ mo</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="opacity-75">Per year</p>
            <p className="font-semibold tabular-nums">{formatCurrency(yearly)}</p>
          </div>
          <div>
            <p className="opacity-75">Active</p>
            <p className="font-semibold tabular-nums">{activeSubs.length}</p>
          </div>
          <div>
            <p className="opacity-75">Next charge</p>
            <p className="font-semibold tabular-nums">
              {upcomingSub ? new Date(upcomingSub.next_billing_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
            </p>
          </div>
        </div>
      </section>

      {!isPremium && activeSubs.length > 0 && (
        <section className={"mt-4 rounded-2xl border p-4 " + (activeSubs.length >= FREE_SUBSCRIPTION_LIMIT ? "border-primary/40 bg-primary/5" : "border-border bg-card")}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Free plan</p>
              <p className="mt-0.5 text-sm font-semibold">
                {Math.min(activeSubs.length, FREE_SUBSCRIPTION_LIMIT)} of {FREE_SUBSCRIPTION_LIMIT} tracked
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0 bg-gradient-primary hover:opacity-90">
              <Link to="/pricing"><Crown className="h-3.5 w-3.5" /> Upgrade</Link>
            </Button>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-primary transition-all" style={{ width: `${Math.min(100, (activeSubs.length / FREE_SUBSCRIPTION_LIMIT) * 100)}%` }} />
          </div>
        </section>
      )}

      {/* Renewal reminders */}
      {upcomingRenewals.length > 0 && (
        <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <Bell className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                {upcomingRenewals.length} renewal{upcomingRenewals.length === 1 ? "" : "s"} in the next {REMINDER_DAYS} days
              </h3>
              <ul className="mt-2 space-y-1.5">
                {upcomingRenewals.map(({ sub: s, days }) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <ServiceAvatar name={s.name} size={24} />
                      <span className="truncate font-medium text-amber-950 dark:text-amber-50">{s.name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-amber-800 dark:text-amber-200 tabular-nums">
                      {formatCurrency(Number(s.cost))} · {days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Price alerts banner (Premium) */}
      {isPremium && priceAlerts.length > 0 && (
        <section className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold">
                {priceAlertsUnread > 0
                  ? `${priceAlertsUnread} new price alert${priceAlertsUnread === 1 ? "" : "s"}`
                  : `${priceAlerts.length} price change${priceAlerts.length === 1 ? "" : "s"} tracked`}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {priceAlerts.slice(0, 2).map((a) => a.subscription_name).filter(Boolean).join(", ")}
                {priceAlerts.length > 2 ? ` and ${priceAlerts.length - 2} more` : ""}
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link to="/app/alerts">Review</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Savings card */}
      {cancelledSubs.length > 0 && (
        <section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-card-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Saved so far</p>
              <p className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatCurrency(totalSaved)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Per month</p>
              <p className="font-semibold tabular-nums">{formatCurrency(monthlySavings)}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            From {cancelledSubs.length} cancelled subscription{cancelledSubs.length === 1 ? "" : "s"}.
          </p>
        </section>
      )}

      {/* Quick add */}
      <QuickAddRow />

      {/* Chart */}
      {subs.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card-soft">
          <h2 className="text-sm font-semibold text-muted-foreground">Spending over time</h2>
          <div className="-mx-2 mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={45} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Spend"]}
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#spend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* List with active/cancelled tabs */}
      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "cancelled")}>
            <TabsList>
              <TabsTrigger value="active">Active ({activeSubs.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledSubs.length})</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost" className="text-xs text-muted-foreground">
              <Link to="/app/debug-icons">Debug icons</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link to="/app/scan">
                <ScanLine className="h-4 w-4" /> Scan
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/add">
                <Plus className="h-4 w-4" /> Add
              </Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : visibleSubs.length === 0 ? (
          tab === "active" ? <EmptyState /> : <EmptyCancelled />
        ) : (
          <ul className="mt-3 space-y-2">
            {visibleSubs.map((s) => {
              const cat = getCategoryMeta(s.category);
              const isCancelled = s.status === "cancelled";
              return (
                <li key={s.id} className={"group rounded-2xl border border-border bg-card p-3 shadow-card-soft transition hover:shadow-elegant sm:p-4 " + (isCancelled ? "opacity-75" : "")}>
                  <div className="flex items-center gap-3">
                    <ServiceAvatar name={s.name} size={44} className={isCancelled ? "grayscale" : ""} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={"truncate font-semibold " + (isCancelled ? "line-through text-muted-foreground" : "")}>{s.name}</p>
                        <Badge variant="secondary" className="hidden text-xs sm:inline-flex">
                          <cat.icon className="h-3 w-3" /> {cat.label}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {isCancelled
                            ? `Cancelled ${s.cancelled_at ? new Date(s.cancelled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}`
                            : `Next: ${new Date(s.next_billing_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <p className="font-bold tabular-nums">{formatCurrency(Number(s.cost))}</p>
                      <p className="text-xs text-muted-foreground">/ {s.billing_cycle === "yearly" ? "yr" : s.billing_cycle === "weekly" ? "wk" : "mo"}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-1 sm:mt-1">
                    {isCancelled ? (
                      <Button variant="ghost" size="sm" className="h-8 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40" onClick={() => handleReactivate(s)}>
                        <RotateCcw className="h-3.5 w-3.5" /> Reactivate
                      </Button>
                    ) : (
                      <>
                        <Button asChild variant="ghost" size="sm" className="h-8 text-muted-foreground">
                          <Link to="/app/edit/$id" params={{ id: s.id }}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={() => handleCancel(s)}>
                          <Ban className="h-3.5 w-3.5" /> Cancel
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteId(s.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Floating add button */}
      <Link
        to="/app/add"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-elegant transition hover:scale-105"
        aria-label="Add subscription"
      >
        <Plus className="h-6 w-6" />
      </Link>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes it. Tip: cancel instead to keep tracking your savings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="mt-4 rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-elegant">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold">No active subscriptions</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap a quick-add above, add one manually, or scan a bank statement to find them all at once.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button asChild className="bg-gradient-primary hover:opacity-90">
          <Link to="/app/add">
            <Plus className="h-4 w-4" /> Add subscription
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/app/scan">
            <ScanLine className="h-4 w-4" /> Scan statement
          </Link>
        </Button>
      </div>
    </div>
  );
}

function EmptyCancelled() {
  return (
    <div className="mt-4 rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        <PiggyBank className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold">No cancelled subscriptions yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Cancel a subscription to start tracking your savings here.
      </p>
    </div>
  );
}
