import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CATEGORIES, SERVICE_PRESETS, getServicePreset, formatCurrency, type ServicePreset } from "@/lib/services";
import { ServiceAvatar } from "@/components/ServiceAvatar";
import { Switch } from "@/components/ui/switch";
import { Bell, Crown, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface SubscriptionFormValue {
  name: string;
  cost: number;
  billing_cycle: "weekly" | "monthly" | "yearly";
  next_billing_date: string;
  category: string;
  alerts_enabled: boolean;
  alert_threshold_pct: number;
  shared_with_count: number;
}

interface Props {
  initial?: Partial<SubscriptionFormValue>;
  submitting?: boolean;
  onSubmit: (v: SubscriptionFormValue) => void;
  submitLabel: string;
  /** When true, shows price-alert configuration (Premium feature). */
  showAlerts?: boolean;
  /** When false (free tier), shows an upsell card instead of the inputs. */
  alertsAvailable?: boolean;
}

export function SubscriptionForm({ initial, submitting, onSubmit, submitLabel, showAlerts = false, alertsAvailable = true }: Props) {
  const navigate = useNavigate();
  const [name, setName] = useState(initial?.name ?? "");
  const [cost, setCost] = useState(initial?.cost?.toString() ?? "");
  const [cycle, setCycle] = useState<"weekly" | "monthly" | "yearly">(initial?.billing_cycle ?? "monthly");
  const [date, setDate] = useState(initial?.next_billing_date ?? new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(initial?.category ?? "other");
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(initial?.alerts_enabled ?? true);
  const [thresholdPct, setThresholdPct] = useState<string>(
    initial?.alert_threshold_pct !== undefined ? String(initial.alert_threshold_pct) : "0",
  );
  const [sharedWith, setSharedWith] = useState<string>(
    initial?.shared_with_count ? String(initial.shared_with_count) : "1",
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-detect category from service name
  useEffect(() => {
    if (!initial?.category) {
      const preset = getServicePreset(name);
      if (preset) setCategory(preset.category);
    }
  }, [name, initial?.category]);

  const suggestions = name.length > 0
    ? SERVICE_PRESETS.filter((p) => p.name.toLowerCase().includes(name.toLowerCase())).slice(0, 5)
    : [];

  // Detect a category/service mismatch — only when the typed name matches a known preset exactly.
  const matchedPreset = (() => {
    const lower = name.trim().toLowerCase();
    if (!lower) return undefined;
    return SERVICE_PRESETS.find((p) => p.name.toLowerCase() === lower);
  })();
  const categoryMismatch = !!matchedPreset && matchedPreset.category !== category;
  const suggestedCategoryMeta = matchedPreset ? CATEGORIES.find((c) => c.value === matchedPreset.category) : undefined;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(cost);
    if (!name.trim() || isNaN(parsed) || parsed < 0) return;
    if (categoryMismatch) return;
    const threshold = Math.max(0, parseFloat(thresholdPct) || 0);
    const seats = Math.max(1, Math.min(50, Math.round(parseFloat(sharedWith) || 1)));
    onSubmit({
      name: name.trim(),
      cost: parsed,
      billing_cycle: cycle,
      next_billing_date: date,
      category,
      alerts_enabled: alertsEnabled,
      alert_threshold_pct: threshold,
      shared_with_count: seats,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Service name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Service name</Label>
        <div className="relative">
          <div className="flex items-center gap-3 rounded-md border border-input bg-background pl-2 focus-within:ring-2 focus-within:ring-ring">
            <ServiceAvatar name={name || "?"} size={32} />
            <Input
              id="name"
              value={name}
              onChange={(e) => { setName(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. Netflix"
              required
              maxLength={80}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setName(s.name); setCategory(s.category); setShowSuggestions(false); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <ServiceAvatar name={s.name} size={28} />
                  <span className="font-medium">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular service picker */}
        <div className="mt-2">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Popular services</p>
          <div className="flex flex-wrap gap-2">
            {SERVICE_PRESETS.slice(0, 14).map((p: ServicePreset) => {
              const selected = name.trim().toLowerCase() === p.name.toLowerCase();
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setName(p.name);
                    setCategory(p.category);
                    if (!cost && p.defaultCost) setCost(String(p.defaultCost));
                    setShowSuggestions(false);
                  }}
                  className={
                    "flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs transition " +
                    (selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background hover:border-primary/50 hover:bg-muted")
                  }
                  aria-label={`Use ${p.name}`}
                >
                  <ServiceAvatar name={p.name} size={20} className="!rounded-md" />
                  <span className="font-medium">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cost */}
      <div className="space-y-1.5">
        <Label htmlFor="cost">Cost</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="cost"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
            required
            className="pl-7 text-base"
          />
        </div>
        {cost && !isNaN(parseFloat(cost)) && (
          <p className="text-xs text-muted-foreground">
            {formatCurrency(parseFloat(cost))} {cycle === "weekly" ? "per week" : cycle === "yearly" ? "per year" : "per month"}
          </p>
        )}
      </div>

      {/* Billing cycle */}
      <div className="space-y-1.5">
        <Label>Billing cycle</Label>
        <ToggleGroup
          type="single"
          value={cycle}
          onValueChange={(v) => v && setCycle(v as typeof cycle)}
          className="grid w-full grid-cols-3 gap-2"
        >
          <ToggleGroupItem value="weekly" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Weekly</ToggleGroupItem>
          <ToggleGroupItem value="monthly" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Monthly</ToggleGroupItem>
          <ToggleGroupItem value="yearly" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Yearly</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Next billing date */}
      <div className="space-y-1.5">
        <Label htmlFor="date">Next billing date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category" aria-invalid={categoryMismatch || undefined} className={categoryMismatch ? "border-destructive focus-visible:ring-destructive" : ""}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                <span className="flex items-center gap-2">
                  <c.icon className="h-4 w-4" />
                  {c.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {categoryMismatch && matchedPreset && suggestedCategoryMeta && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <span>
              <strong>{matchedPreset.name}</strong> is usually <strong>{suggestedCategoryMeta.label}</strong>. Pick that to keep the icon consistent.
            </span>
            <button
              type="button"
              onClick={() => setCategory(matchedPreset.category)}
              className="ml-auto rounded-full border border-destructive/40 bg-background px-2 py-0.5 text-[11px] font-semibold text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
            >
              Use {suggestedCategoryMeta.label}
            </button>
          </div>
        )}
      </div>

      {/* Family / shared plan */}
      <div className="space-y-1.5 rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-2">
          <Users className="mt-0.5 h-4 w-4 text-primary" />
          <div className="min-w-0 flex-1">
            <Label htmlFor="shared" className="text-sm font-semibold">Sharing this plan?</Label>
            <p className="text-xs text-muted-foreground">
              Split the cost across people. Only your share counts toward your monthly total.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Input
            id="shared"
            type="number"
            min={1}
            max={50}
            step={1}
            value={sharedWith}
            onChange={(e) => setSharedWith(e.target.value)}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">
            {Number(sharedWith) > 1
              ? `${formatCurrency((parseFloat(cost) || 0) / Number(sharedWith))} each / ${cycle === "weekly" ? "wk" : cycle === "yearly" ? "yr" : "mo"}`
              : "Just me"}
          </span>
        </div>
      </div>

      {showAlerts && (
        alertsAvailable ? (
          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Bell className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Price alerts</p>
                  <p className="text-xs text-muted-foreground">
                    We'll notify you when this subscription's price changes.
                  </p>
                </div>
              </div>
              <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
            </div>
            {alertsEnabled && (
              <div className="space-y-1.5">
                <Label htmlFor="threshold" className="text-xs">Alert threshold (%)</Label>
                <div className="relative">
                  <Input
                    id="threshold"
                    type="number"
                    min={0}
                    max={500}
                    step={1}
                    value={thresholdPct}
                    onChange={(e) => setThresholdPct(e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {parseFloat(thresholdPct) > 0
                    ? `Alert me when the price changes by ${parseFloat(thresholdPct)}% or more.`
                    : "Alert me on any price change."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <Link to="/pricing" className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-4 transition hover:border-primary/60">
            <Crown className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Get price alerts with Premium</p>
              <p className="text-xs text-muted-foreground">
                Be the first to know when this subscription's price goes up — even from bank scans.
              </p>
            </div>
          </Link>
        )
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/app" })} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || categoryMismatch} className="flex-1 bg-gradient-primary hover:opacity-90">
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
