import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Upload, FileText, Loader2, ArrowLeft, Check, AlertCircle, Sparkles, Plus, Eye,
  ShieldCheck, ShieldAlert, Shield, Crown, TrendingUp, TrendingDown, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ServiceAvatar } from "@/components/ServiceAvatar";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, getCategoryMeta } from "@/lib/services";
import { parseCsv, extractPdfText, extractTransactionsFromText } from "@/lib/scanner/parse";
import { analyzeStatement } from "@/lib/scanner/analyze.functions";
import type { RecurringCandidate, RawTransaction } from "@/lib/scanner/types";
import { useSubscription } from "@/hooks/useSubscription";
import { recordPrice } from "@/lib/price-alerts";
import { toast } from "sonner";

export const Route = createFileRoute("/app/scan")({
  head: () => ({
    meta: [
      { title: "Scan bank statement — SubTrack" },
      { name: "description", content: "Upload a bank statement to find forgotten subscriptions." },
    ],
  }),
  component: ScanPage,
});

type Stage = "idle" | "parsing" | "analyzing" | "results";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
      // strip data:...;base64,
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function ScanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const analyze = useServerFn(analyzeStatement);
  const { isPremium, loading: subLoading } = useSubscription();

  if (!subLoading && !isPremium) {
    return <ScanPaywall />;
  }


  const [stage, setStage] = useState<Stage>("idle");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [candidates, setCandidates] = useState<RecurringCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cycleOverrides, setCycleOverrides] = useState<Record<string, RecurringCandidate["cycle"]>>({});
  const [txnCount, setTxnCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Existing subs for the price-change correction dropdown.
  type ExistingSub = { id: string; name: string; cost: number };
  const [existingSubs, setExistingSubs] = useState<ExistingSub[]>([]);

  // Per-candidate review of detected price changes.
  // value: subscription id to record against, "__skip__" to skip, or undefined (unset).
  const [priceMatchOverrides, setPriceMatchOverrides] = useState<Record<string, string>>({});
  const [recordingPrices, setRecordingPrices] = useState(false);
  const [pricesRecorded, setPricesRecorded] = useState(false);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("subscriptions")
      .select("id,name,cost")
      .eq("status", "active")
      .then(({ data }) => {
        if (data) setExistingSubs(data.map((r) => ({ id: r.id, name: r.name, cost: Number(r.cost) })));
      });
  }, [user]);

  function reset() {
    setStage("idle");
    setStatusMsg("");
    setCandidates([]);
    setSelected(new Set());
    setCycleOverrides({});
    setTxnCount(0);
    setError(null);
    setPriceMatchOverrides({});
    setPricesRecorded(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File) {
    setError(null);
    setCandidates([]);
    setSelected(new Set());

    if (file.size > 15 * 1024 * 1024) {
      setError("File is over 15MB. Try splitting your statement.");
      return;
    }

    setStage("parsing");
    setStatusMsg("Reading file…");

    try {
      let transactions: RawTransaction[] | undefined;
      let pdfBase64: string | undefined;

      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isCsv = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");

      if (isCsv) {
        const text = await file.text();
        transactions = parseCsv(text);
        if (!transactions.length) throw new Error("No transactions parsed from CSV.");
      } else if (isPdf) {
        setStatusMsg("Extracting text from PDF…");
        const { text, looksScanned } = await extractPdfText(file);
        if (!looksScanned) {
          transactions = extractTransactionsFromText(text);
        }
        if (!transactions || transactions.length < 3) {
          // Fall back to OCR via server
          setStatusMsg("Looks like a scanned PDF — running OCR…");
          pdfBase64 = await fileToBase64(file);
          transactions = undefined;
        }
      } else {
        throw new Error("Only CSV and PDF files are supported.");
      }

      setStage("analyzing");
      setStatusMsg(
        pdfBase64
          ? "AI is reading your statement and finding patterns…"
          : `Analyzing ${transactions?.length ?? 0} transactions…`,
      );

      const result = await analyze({ data: { transactions, pdfBase64 } });

      if (result.error) {
        setError(result.error);
        setStage("idle");
        return;
      }

      setTxnCount(result.transactionCount);
      setCandidates(result.candidates);
      // Pre-select high-confidence, not-yet-tracked candidates only
      setSelected(
        new Set(
          result.candidates
            .filter((c) => !c.alreadyTracked && c.confidence >= 70)
            .map((c) => c.name),
        ),
      );
      setStage("results");

      // Pre-fill the price-change review with the auto-detected matches.
      // Users can confirm, change the matched subscription, or skip before
      // we actually record any price observations.
      const prefill: Record<string, string> = {};
      for (const c of result.candidates) {
        if (c.matchedSubscriptionId && c.matchedSubscriptionCost !== undefined &&
            Math.abs(c.matchedSubscriptionCost - c.amount) >= 0.01) {
          prefill[c.name] = c.matchedSubscriptionId;
        }
      }
      setPriceMatchOverrides(prefill);
      setPricesRecorded(false);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to scan file");
      setStage("idle");
    }
  }

  // Candidates whose detected amount looks like a price change for some
  // existing subscription — either auto-matched, or manually selectable.
  function getPriceChangeReviewItems() {
    return candidates
      .map((c) => {
        const autoMatch = c.matchedSubscriptionId && c.matchedSubscriptionCost !== undefined &&
          Math.abs(c.matchedSubscriptionCost - c.amount) >= 0.01;
        if (!autoMatch) return null;
        return c;
      })
      .filter((c): c is RecurringCandidate => c !== null);
  }

  async function confirmPriceChanges() {
    if (!user) return;
    setRecordingPrices(true);
    let recorded = 0;
    for (const c of getPriceChangeReviewItems()) {
      const choice = priceMatchOverrides[c.name];
      if (!choice || choice === "__skip__") continue;
      const sub = existingSubs.find((s) => s.id === choice);
      if (!sub) continue;
      if (Math.abs(sub.cost - c.amount) < 0.01) continue;
      await recordPrice({
        subscriptionId: choice,
        userId: user.id,
        cost: c.amount,
        source: "scan",
      });
      recorded += 1;
    }
    setRecordingPrices(false);
    setPricesRecorded(true);
    if (recorded > 0) {
      toast.success(`${recorded} price change${recorded === 1 ? "" : "s"} recorded`, {
        description: "Check your price alerts.",
      });
    } else {
      toast.message("No price changes recorded");
    }
  }


  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function addSelected() {
    if (!user || selected.size === 0) return;
    setAdding(true);
    const today = new Date().toISOString().slice(0, 10);
    const rows = candidates
      .filter((c) => selected.has(c.name))
      .map((c) => ({
        user_id: user.id,
        name: c.name,
        cost: c.amount,
        billing_cycle: cycleOverrides[c.name] ?? c.cycle,
        next_billing_date: today,
        category: c.category,
        status: "active" as const,
      }));
    const { error: insertErr } = await supabase.from("subscriptions").insert(rows);
    setAdding(false);
    if (insertErr) {
      toast.error(insertErr.message);
      return;
    }
    toast.success(`Added ${rows.length} subscription${rows.length === 1 ? "" : "s"}`);
    navigate({ to: "/app" });
  }

  const isBusy = stage === "parsing" || stage === "analyzing";
  const newCount = candidates.filter((c) => !c.alreadyTracked).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link
        to="/app"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="mt-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Scan a bank statement</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop a CSV or PDF. We find every recurring charge and surface the subs you forgot you had.
            The file never leaves this scan — nothing is stored.
          </p>
        </div>
      </div>

      {/* Upload zone */}
      {stage === "idle" && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/50 px-6 py-12 transition hover:border-primary hover:bg-card"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Click to upload a statement</p>
              <p className="mt-1 text-xs text-muted-foreground">CSV or PDF · scanned PDFs supported · max 15MB</p>
            </div>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.pdf,text/csv,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">How it works</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Export your statement from your bank as CSV (preferred) or PDF.</li>
              <li>We parse it locally, then send only the cleaned transactions to AI for merchant-name cleanup.</li>
              <li>Recurring charges get grouped, ranked, and listed below for one-click adding.</li>
              <li>Nothing is stored. Refresh the page and it's gone.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Loading */}
      {isBusy && (
        <div className="mt-10 flex flex-col items-center gap-3 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">{statusMsg}</p>
          <p className="text-xs text-muted-foreground">This can take 10–30 seconds for PDFs.</p>
        </div>
      )}

      {/* Review & confirm */}
      {stage === "results" && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Review & confirm</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Found <span className="font-semibold text-foreground">{candidates.length}</span> recurring charge
                {candidates.length === 1 ? "" : "s"} in {txnCount} transaction{txnCount === 1 ? "" : "s"}.
                {newCount > 0 && ` ${newCount} new — toggle the ones to save.`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              Scan another file
            </Button>
          </div>

          <PriceChangeReview
            items={getPriceChangeReviewItems()}
            existingSubs={existingSubs}
            overrides={priceMatchOverrides}
            setOverrides={setPriceMatchOverrides}
            recording={recordingPrices}
            recorded={pricesRecorded}
            onConfirm={confirmPriceChanges}
          />

          {candidates.length === 0 ? (
            <div className="mt-8 rounded-xl border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              <FileText className="mx-auto mb-3 h-8 w-8 opacity-50" />
              No recurring charges detected. Either you're a saint, or your statement covers too short a period
              (we need 2+ months to spot patterns).
            </div>
          ) : (
            <>
              <ul className="mt-4 space-y-3">
                {candidates.map((c) => {
                  const checked = selected.has(c.name);
                  const cat = getCategoryMeta(c.category);
                  const cycle = cycleOverrides[c.name] ?? c.cycle;
                  const conf = c.confidence;
                  const confTier =
                    conf >= 75 ? "high" : conf >= 50 ? "medium" : "low";
                  const ConfIcon =
                    confTier === "high" ? ShieldCheck : confTier === "medium" ? Shield : ShieldAlert;
                  const confColor =
                    confTier === "high"
                      ? "text-emerald-500"
                      : confTier === "medium"
                        ? "text-amber-500"
                        : "text-destructive";
                  const progressColor =
                    confTier === "high"
                      ? "[&>div]:bg-emerald-500"
                      : confTier === "medium"
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-destructive";
                  return (
                    <li
                      key={c.name}
                      className={
                        "rounded-2xl border bg-card p-4 shadow-card-soft transition " +
                        (checked ? "border-primary/60 ring-1 ring-primary/40" : "border-border")
                      }
                    >
                      <div className="flex items-start gap-3">
                        <ServiceAvatar name={c.name} size={42} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold">{c.name}</p>
                            {c.alreadyTracked && (
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <Check className="h-3 w-3" /> already tracked
                              </Badge>
                            )}
                            <Badge variant="outline" className={`gap-1 text-xs ${confColor}`}>
                              <ConfIcon className="h-3 w-3" /> {conf}% confidence
                            </Badge>
                            {c.alreadyTracked && c.matchedSubscriptionName && (
                              <Badge variant="outline" className="gap-1 text-xs">
                                matched: {c.matchedSubscriptionName}
                                {typeof c.matchScore === "number" && ` · ${c.matchScore}%`}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <cat.icon className="h-3 w-3" /> {cat.label}
                            </span>
                            <span>·</span>
                            <span>{c.occurrences} charges</span>
                            <span>·</span>
                            <span>last {c.lastSeen}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold tabular-nums">{formatCurrency(c.amount)}</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            / {cycle.replace("ly", "")}
                          </p>
                        </div>
                      </div>

                      {/* Confidence bar + reason */}
                      <div className="mt-3">
                        <Progress value={conf} className={`h-1.5 ${progressColor}`} />
                        <p className="mt-1 text-[11px] text-muted-foreground">{c.confidenceReason}</p>
                      </div>

                      {/* Editable cycle + confirm toggle */}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            Cycle:
                          </span>
                          {(["weekly", "monthly", "yearly"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                setCycleOverrides((prev) => ({ ...prev, [c.name]: opt }))
                              }
                              className={
                                "rounded-md border px-2 py-0.5 text-xs font-medium transition " +
                                (cycle === opt
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:text-foreground")
                              }
                            >
                              {opt}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => !c.alreadyTracked && toggle(c.name)}
                          disabled={c.alreadyTracked}
                          className={
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition " +
                            (c.alreadyTracked
                              ? "cursor-not-allowed border-border bg-muted text-muted-foreground"
                              : checked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:border-primary hover:text-primary")
                          }
                        >
                          {checked ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          {c.alreadyTracked ? "Skipped" : checked ? "Confirmed" : "Confirm"}
                        </button>
                      </div>

                      <details className="mt-3 group">
                        <summary className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                          <Eye className="h-3 w-3" /> Show raw descriptor
                        </summary>
                        <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                          {c.raw}
                        </p>
                      </details>
                    </li>
                  );
                })}
              </ul>

              <div className="sticky bottom-4 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/95 p-3 shadow-elegant backdrop-blur">
                <p className="text-sm">
                  <span className="font-bold">{selected.size}</span>{" "}
                  <span className="text-muted-foreground">selected</span>
                </p>
                <Button onClick={addSelected} disabled={selected.size === 0 || adding} size="lg">
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span className="ml-1.5">Add {selected.size} to dashboard</span>
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}

interface PriceChangeReviewProps {
  items: RecurringCandidate[];
  existingSubs: { id: string; name: string; cost: number }[];
  overrides: Record<string, string>;
  setOverrides: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  recording: boolean;
  recorded: boolean;
  onConfirm: () => void;
}

function PriceChangeReview({
  items, existingSubs, overrides, setOverrides, recording, recorded, onConfirm,
}: PriceChangeReviewProps) {
  if (items.length === 0) return null;

  const pendingCount = items.filter((c) => {
    const v = overrides[c.name];
    return v && v !== "__skip__";
  }).length;

  return (
    <div className="mt-5 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4">
      <div className="flex items-start gap-2">
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold">Confirm price changes</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            We detected {items.length} charge{items.length === 1 ? "" : "s"} that may differ from
            what you have saved. Confirm the matched subscription, pick a different one, or skip
            before we record the change.
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {items.map((c) => {
          const choice = overrides[c.name] ?? "";
          const matchedSub = existingSubs.find((s) => s.id === choice);
          const oldCost = matchedSub?.cost;
          const isSkip = choice === "__skip__";
          const diff = oldCost !== undefined ? c.amount - oldCost : null;
          const direction = diff === null ? null : diff > 0 ? "up" : "down";

          return (
            <li
              key={c.name}
              className="rounded-xl border border-border bg-background/70 p-3"
            >
              <div className="flex items-start gap-3">
                <ServiceAvatar name={c.name} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Detected {formatCurrency(c.amount)}
                    {oldCost !== undefined && !isSkip && (
                      <>
                        {" · was "}{formatCurrency(oldCost)}{" "}
                        <span
                          className={
                            "inline-flex items-center gap-0.5 font-medium " +
                            (direction === "up" ? "text-amber-600" : "text-emerald-600")
                          }
                        >
                          {direction === "up" ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {diff !== null && (diff > 0 ? "+" : "")}
                          {formatCurrency(diff ?? 0)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Select
                  value={choice}
                  onValueChange={(v) => setOverrides((p) => ({ ...p, [c.name]: v }))}
                  disabled={recorded}
                >
                  <SelectTrigger className="h-8 flex-1 min-w-[180px] text-xs">
                    <SelectValue placeholder="Pick a subscription…" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingSubs.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">
                        {s.name} ({formatCurrency(s.cost)})
                      </SelectItem>
                    ))}
                    <SelectItem value="__skip__" className="text-xs">
                      Skip — not a price change
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isSkip && (
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <X className="h-3 w-3" /> skipped
                  </Badge>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          {recorded
            ? "Price changes recorded."
            : `${pendingCount} of ${items.length} will be recorded.`}
        </p>
        <Button
          size="sm"
          onClick={onConfirm}
          disabled={recording || recorded}
          className="gap-1"
        >
          {recording ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : recorded ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {recorded ? "Recorded" : "Confirm price changes"}
        </Button>
      </div>
    </div>
  );
}

function ScanPaywall() {
  return (
    <main className="mx-auto max-w-md px-4 pt-4">
      <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="mt-8 rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-card to-primary/5 p-6 text-center shadow-elegant">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-elegant">
          <Crown className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Bank scanner is a Premium feature</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a statement, let AI find every recurring charge, and add the ones you forgot — in seconds.
        </p>
        <Button asChild className="mt-6 w-full bg-gradient-primary hover:opacity-90">
          <Link to="/pricing">
            <Crown className="h-4 w-4" /> Upgrade for $2.99/mo
          </Link>
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">Cancel anytime.</p>
      </div>
    </main>
  );
}
