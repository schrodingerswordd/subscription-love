import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CATEGORIES, SERVICE_PRESETS, getServicePreset, formatCurrency } from "@/lib/services";
import { ServiceAvatar } from "@/components/ServiceAvatar";
import { Switch } from "@/components/ui/switch";
import { Bell, Crown } from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface SubscriptionFormValue {
  name: string;
  cost: number;
  billing_cycle: "weekly" | "monthly" | "yearly";
  next_billing_date: string;
  category: string;
  alerts_enabled: boolean;
  alert_threshold_pct: number;
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(cost);
    if (!name.trim() || isNaN(parsed) || parsed < 0) return;
    const threshold = Math.max(0, parseFloat(thresholdPct) || 0);
    onSubmit({
      name: name.trim(),
      cost: parsed,
      billing_cycle: cycle,
      next_billing_date: date,
      category,
      alerts_enabled: alertsEnabled,
      alert_threshold_pct: threshold,
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
          <SelectTrigger id="category">
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
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/app" })} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="flex-1 bg-gradient-primary hover:opacity-90">
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
