import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ExternalLink, Loader2, Receipt, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBillingHistory, type BillingHistoryItem } from "@/server/billing.functions";
import { getPaddleEnvironment } from "@/lib/paddle";
import { toast } from "sonner";
import { BunkerWrapper } from "./BunkerWrapper";

function statusVariant(status: string): { label: string; className: string } {
  const s = status.toLowerCase();
  if (s === "completed" || s === "paid" || s === "billed")
    return { label: "AUTHENTICATED", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
  if (s === "past_due" || s === "payment_failed")
    return { label: "PROTOCOL FAILURE", className: "bg-destructive/15 text-destructive border-destructive/30" };
  return { label: status.toUpperCase(), className: "bg-muted text-muted-foreground border-border" };
}

function formatDate(s: string | null) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }).toUpperCase();
  } catch {
    return "—";
  }
}

export const VaultBilling = () => {
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
          toast.error("COMMUNICATIONS FAILURE: UNABLE TO RETRIEVE REQUISITION LOGS");
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
    <BunkerWrapper variant="blue">
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm" className="rounded-none border-primary/30 hover:bg-primary/10">
              <Link to="/app">
                <ArrowLeft className="h-4 w-4 mr-2" /> EXIT TO HUB
              </Link>
            </Button>
            <div className="h-8 w-px bg-primary/20 mx-2" />
            <h1 className="text-2xl font-bold tracking-[0.2em] uppercase bunker-glow text-primary">
              Requisition Logs
            </h1>
          </div>
          <div className="text-right font-mono text-[10px] text-primary/40 uppercase">
            Sec-Class: B-4 // Billing Data
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="bg-black/40 border-primary/20 p-6 rounded-none backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-primary/60">
              <Terminal className="h-4 w-4" />
              <span className="text-xs font-mono uppercase tracking-widest">Archive Status: Online</span>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-primary/60">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <span className="text-xs font-mono animate-pulse uppercase tracking-[0.3em]">Decoding Transaction Stream...</span>
              </div>
            ) : error ? (
              <div className="p-4 border border-destructive/50 bg-destructive/5 text-destructive text-sm font-mono uppercase tracking-wider">
                FATAL ERROR: {error}
              </div>
            ) : items && items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center opacity-60">
                <Receipt className="h-12 w-12 text-primary/40" />
                <p className="font-bold uppercase tracking-widest text-primary/60">No Requisition History Found</p>
                <p className="text-xs text-muted-foreground uppercase max-w-xs">
                  Your resource allocation history is currently empty. Initialize a subscription to populate this log.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items?.map((it) => {
                  const v = statusVariant(it.status);
                  return (
                    <div key={it.id} className="group relative p-5 border border-primary/10 bg-primary/5 hover:border-primary/40 transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold font-mono text-primary bunker-glow">
                              {it.currency} {it.amount}
                            </span>
                            <Badge variant="outline" className={v.className + " rounded-none text-[10px] tracking-tighter"}>
                              {v.label}
                            </Badge>
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest space-y-1">
                            <div>TIMESTAMP: {formatDate(it.billedAt)}</div>
                            {it.periodStart && it.periodEnd && (
                              <div className="text-primary/40">
                                DURATION: {formatDate(it.periodStart)} {">"} {formatDate(it.periodEnd)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {it.invoiceUrl && (
                            <Button asChild variant="outline" size="sm" className="rounded-none border-primary/40 text-[10px] uppercase tracking-widest h-8">
                              <a href={it.invoiceUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-2" /> Download Document
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/20 group-hover:border-primary/60" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/20 group-hover:border-primary/60" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          
          <div className="mt-4 p-4 border border-primary/10 bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-primary/60 uppercase tracking-[0.2em]">Encrypted Session Active</span>
            </div>
            <span className="text-[10px] font-mono text-primary/40 uppercase">V-LOG-AUTH-OK</span>
          </div>
        </div>
      </main>
    </BunkerWrapper>
  );
};
