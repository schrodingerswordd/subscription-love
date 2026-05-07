import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ExternalLink, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBillingHistory, type BillingHistoryItem } from "@/server/billing.functions";
import { getPaddleEnvironment } from "@/lib/paddle";
import { toast } from "sonner";

export const Route = createFileRoute("/app/billing")({
  component: BillingHistoryPage,
  head: () => ({ meta: [{ title: "Billing history – SubTrack" }] }),
});

function statusVariant(status: string): { label: string; className: string } {
  const s = status.toLowerCase();
  if (s === "completed" || s === "paid" || s === "billed")
    return { label: "Paid", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" };
  if (s === "past_due" || s === "payment_failed")
    return { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/30" };
  if (s === "ready" || s === "draft")
    return { label: "Pending", className: "bg-muted text-muted-foreground border-border" };
  if (s === "canceled")
    return { label: "Canceled", className: "bg-muted text-muted-foreground border-border" };
  return { label: status, className: "bg-muted text-muted-foreground border-border" };
}

function formatDate(s: string | null) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function BillingHistoryPage() {
  const fetchHistory = useServerFn(getBillingHistory);
  const [items, setItems] = useState<BillingHistoryItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { items } = await fetchHistory({ data: { environment: getPaddleEnvironment() } });
        if (active) setItems(items);
      } catch (e) {
        if (active) {
          setError((e as Error).message);
          toast.error("Couldn't load billing history");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchHistory]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/app">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Billing history</h1>
        <p className="text-sm text-muted-foreground">Past invoices, renewal dates, and payment outcomes.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <Card className="p-6 text-sm text-destructive">{error}</Card>
      )}

      {!loading && !error && items && items.length === 0 && (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <Receipt className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No invoices yet</p>
          <p className="text-sm text-muted-foreground">
            Once you subscribe to Premium, your invoices will appear here.
          </p>
        </Card>
      )}

      {!loading && !error && items && items.length > 0 && (
        <div className="space-y-3">
          {items.map((it) => {
            const v = statusVariant(it.status);
            return (
              <Card key={it.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {it.currency} {it.amount}
                      </span>
                      <Badge variant="outline" className={v.className}>
                        {v.label}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {formatDate(it.billedAt)}
                      {it.periodStart && it.periodEnd && (
                        <>
                          {" · "}Period {formatDate(it.periodStart)} – {formatDate(it.periodEnd)}
                        </>
                      )}
                    </div>
                    {it.invoiceNumber && (
                      <div className="mt-0.5 text-xs text-muted-foreground">Invoice #{it.invoiceNumber}</div>
                    )}
                  </div>
                  {it.invoiceUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={it.invoiceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" /> Invoice
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
