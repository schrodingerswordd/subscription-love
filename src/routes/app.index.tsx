import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ServiceAvatar } from "@/components/ServiceAvatar";
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
}

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
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const totalMonthly = useMemo(
    () => subs.reduce((sum, s) => sum + toMonthly(Number(s.cost), s.billing_cycle), 0),
    [subs],
  );

  const yearly = totalMonthly * 12;

  const upcomingSub = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...subs]
      .filter((s) => s.next_billing_date >= today)
      .sort((a, b) => a.next_billing_date.localeCompare(b.next_billing_date))[0];
  }, [subs]);

  // Spend over time chart — show monthly spend for last 6 months including current
  const chartData = useMemo(() => {
    const months: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-US", { month: "short" });
      // Sum monthly equivalent for subs that existed at that point
      const cutoff = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const value = subs
        .filter((s) => new Date(s.created_at) < cutoff)
        .reduce((sum, s) => sum + toMonthly(Number(s.cost), s.billing_cycle), 0);
      months.push({ label, value: Math.round(value * 100) / 100 });
    }
    return months;
  }, [subs]);

  async function handleDelete(id: string) {
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSubs((prev) => prev.filter((s) => s.id !== id));
    toast.success("Subscription deleted");
    setDeleteId(null);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6">
      {/* Total monthly cost — the focal point */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant sm:p-8">
        <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <p className="text-xs font-medium uppercase tracking-wider opacity-80">
          Total monthly spend
        </p>
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
            <p className="font-semibold tabular-nums">{subs.length}</p>
          </div>
          <div>
            <p className="opacity-75">Next charge</p>
            <p className="font-semibold tabular-nums">
              {upcomingSub ? new Date(upcomingSub.next_billing_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
            </p>
          </div>
        </div>
      </section>

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

      {/* Subscription list */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Your subscriptions</h2>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost" className="text-xs text-muted-foreground">
              <Link to="/app/debug-icons">Debug icons</Link>
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
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : subs.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="mt-3 space-y-2">
            {subs.map((s) => {
              const cat = getCategoryMeta(s.category);
              return (
                <li key={s.id} className="group rounded-2xl border border-border bg-card p-3 shadow-card-soft transition hover:shadow-elegant sm:p-4">
                  <div className="flex items-center gap-3">
                    <ServiceAvatar name={s.name} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{s.name}</p>
                        <Badge variant="secondary" className="hidden text-xs sm:inline-flex">
                          <cat.icon className="h-3 w-3" /> {cat.label}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Next: {new Date(s.next_billing_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <p className="font-bold tabular-nums">{formatCurrency(Number(s.cost))}</p>
                      <p className="text-xs text-muted-foreground">/ {s.billing_cycle.slice(0, -2) === "year" ? "yr" : s.billing_cycle === "weekly" ? "wk" : "mo"}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-1 sm:mt-1">
                    <Button asChild variant="ghost" size="sm" className="h-8 text-muted-foreground">
                      <Link to="/app/edit/$id" params={{ id: s.id }}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                    </Button>
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

      {/* Floating add button (mobile) */}
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
              This will permanently remove it from your dashboard. You can always add it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
      <h3 className="mt-4 font-semibold">No subscriptions yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Add your first subscription to start tracking your monthly spend.
      </p>
      <Button asChild className="mt-5 bg-gradient-primary hover:opacity-90">
        <Link to="/app/add">
          <Plus className="h-4 w-4" /> Add subscription
        </Link>
      </Button>
    </div>
  );
}
