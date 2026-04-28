// Heuristic recurring-charge detection. Pure functions, no I/O.

import type { RawTransaction, RecurringCandidate } from "./types";

/** Strip junk a payment processor adds to the merchant string. */
export function normalizeDescriptor(raw: string): string {
  let s = raw.toUpperCase();
  // Drop processor prefixes
  s = s.replace(/\b(SQ|SQUARE|TST|PAYPAL|VENMO|STRIPE|GOOGLE|APPLE|AMZ|AMZN|AMAZON\sMKTP)\s*\*?\s*/g, "");
  // Drop store / phone / ref numbers and trailing IDs
  s = s.replace(/#?\s*\d{4,}/g, "");
  s = s.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, ""); // phone
  s = s.replace(/\b[A-Z]{2}\s\d{5}\b/g, ""); // state + zip
  s = s.replace(/\.(COM|NET|IO|CO|APP|TV)\b/g, "");
  s = s.replace(/[*_/\\|]+/g, " ");
  s = s.replace(/\s{2,}/g, " ").trim();
  // Take first 3 words max — that's almost always the brand
  const words = s.split(" ").slice(0, 3).join(" ");
  return titleCase(words);
}

function titleCase(s: string) {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function daysBetween(a: string, b: string): number {
  return Math.abs((new Date(a).getTime() - new Date(b).getTime()) / 86_400_000);
}

/** Group transactions by normalized merchant key. */
function groupByMerchant(txns: RawTransaction[]): Map<string, RawTransaction[]> {
  const map = new Map<string, RawTransaction[]>();
  for (const t of txns) {
    const key = normalizeDescriptor(t.description);
    if (!key) continue;
    const arr = map.get(key) ?? [];
    arr.push(t);
    map.set(key, arr);
  }
  return map;
}

/**
 * Detect recurring charges by:
 *   1. grouping transactions by normalized merchant
 *   2. requiring 2+ occurrences with similar amounts (within 15%)
 *   3. checking the average gap between charges fits weekly/monthly/yearly
 */
export function detectRecurring(txns: RawTransaction[]): RecurringCandidate[] {
  const groups = groupByMerchant(txns);
  const candidates: RecurringCandidate[] = [];

  for (const [key, items] of groups.entries()) {
    if (items.length < 2) continue;

    // Sort oldest → newest
    const sorted = items.sort((a, b) => a.date.localeCompare(b.date));

    // Amount consistency: median ± 15%
    const amounts = sorted.map((s) => s.amount);
    const med = median(amounts);
    if (med < 1) continue;
    const consistent = amounts.filter((a) => Math.abs(a - med) / med <= 0.15);
    if (consistent.length < 2) continue;

    // Gap analysis
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(daysBetween(sorted[i - 1].date, sorted[i].date));
    }
    const avgGap = gaps.reduce((s, n) => s + n, 0) / gaps.length;

    let cycle: RecurringCandidate["cycle"] | null = null;
    if (avgGap >= 5 && avgGap <= 10) cycle = "weekly";
    else if (avgGap >= 25 && avgGap <= 35) cycle = "monthly";
    else if (avgGap >= 350 && avgGap <= 380) cycle = "yearly";
    else if (sorted.length >= 3 && avgGap >= 25 && avgGap <= 95) cycle = "monthly"; // tolerate skipped months

    if (!cycle) continue;

    candidates.push({
      name: key,
      raw: sorted[sorted.length - 1].description,
      amount: Math.round(med * 100) / 100,
      cycle,
      occurrences: sorted.length,
      lastSeen: sorted[sorted.length - 1].date,
      category: "other",
      alreadyTracked: false,
    });
  }

  // Sort by amount descending — biggest leeches first.
  return candidates.sort((a, b) => b.amount - a.amount);
}
