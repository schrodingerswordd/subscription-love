import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { detectRecurring } from "@/lib/scanner/detect";
import { SERVICE_PRESETS, type Category } from "@/lib/services";
import type { RawTransaction, RecurringCandidate } from "@/lib/scanner/types";

const TransactionSchema = z.object({
  date: z.string().min(4).max(20),
  description: z.string().min(1).max(500),
  amount: z.number().min(0).max(1_000_000),
});

const InputSchema = z.object({
  // Pre-parsed transactions (CSV path or text-based PDF path)
  transactions: z.array(TransactionSchema).max(10_000).optional(),
  // Base64-encoded PDF for OCR fallback (scanned statements)
  pdfBase64: z.string().max(20_000_000).optional(),
}).refine(
  (v) => !!v.transactions?.length || !!v.pdfBase64,
  { message: "Provide transactions or pdfBase64" },
);

const PRESET_NAMES = SERVICE_PRESETS.map((p) => p.name);

interface CleanupResult {
  cleanedName: string;
  category: Category;
  matchedPresetName: string | null;
}

async function cleanupWithAI(candidates: RecurringCandidate[]): Promise<Map<string, CleanupResult>> {
  const apiKey = process.env.LOVABLE_API_KEY;
  const map = new Map<string, CleanupResult>();
  if (!apiKey || candidates.length === 0) return map;

  const payload = candidates.map((c) => ({
    raw: c.raw.slice(0, 200),
    guess: c.name,
    amount: c.amount,
  }));

  const body = {
    model: "google/gemini-3-flash-preview",
    messages: [
      {
        role: "system",
        content:
          "You normalize bank statement merchant strings into clean subscription brand names. " +
          "Map each entry to a known preset when possible. Return strictly via the tool call.",
      },
      {
        role: "user",
        content:
          `Known presets: ${PRESET_NAMES.join(", ")}\n\n` +
          `Entries to clean (JSON):\n${JSON.stringify(payload)}`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "return_cleaned",
          description: "Return cleaned merchant info for each input entry, in the same order.",
          parameters: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    cleanedName: { type: "string", description: "Brand name, Title Case, e.g. 'Netflix'." },
                    category: {
                      type: "string",
                      enum: [
                        "entertainment", "music", "productivity", "fitness", "news",
                        "cloud", "gaming", "shopping", "education", "ai", "other",
                      ],
                    },
                    matchedPresetName: {
                      type: "string",
                      description: "Exact preset name from the provided list, or empty string if none matches.",
                    },
                  },
                  required: ["cleanedName", "category", "matchedPresetName"],
                  additionalProperties: false,
                },
              },
            },
            required: ["results"],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "return_cleaned" } },
  };

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("AI cleanup failed:", res.status, await res.text().catch(() => ""));
      return map;
    }
    const json = await res.json();
    const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return map;
    const parsed = JSON.parse(args) as { results: CleanupResult[] };
    parsed.results.forEach((r, i) => {
      if (i < candidates.length) map.set(candidates[i].name, {
        cleanedName: r.cleanedName,
        category: r.category as Category,
        matchedPresetName: r.matchedPresetName || null,
      });
    });
  } catch (e) {
    console.error("AI cleanup error:", e);
  }
  return map;
}

async function ocrPdfToTransactions(pdfBase64: string): Promise<RawTransaction[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const body = {
    model: "google/gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content:
          "You extract every debit/charge transaction from a bank statement PDF. " +
          "Ignore credits, deposits, and balances. Return strictly via the tool call.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all charge transactions from this statement." },
          { type: "image_url", image_url: { url: `data:application/pdf;base64,${pdfBase64}` } },
        ],
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "return_transactions",
          description: "All debit/charge transactions found in the statement.",
          parameters: {
            type: "object",
            properties: {
              transactions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string", description: "ISO date YYYY-MM-DD" },
                    description: { type: "string" },
                    amount: { type: "number", description: "Positive number, USD or local currency." },
                  },
                  required: ["date", "description", "amount"],
                  additionalProperties: false,
                },
              },
            },
            required: ["transactions"],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "return_transactions" } },
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 429) throw new Error("Rate limit exceeded — try again in a minute.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add funds in workspace settings.");
  if (!res.ok) throw new Error(`OCR failed: ${res.status}`);
  const json = await res.json();
  const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) return [];
  const parsed = JSON.parse(args) as { transactions: RawTransaction[] };
  return parsed.transactions
    .filter((t) => t && t.date && t.description && Number.isFinite(t.amount))
    .map((t) => ({ ...t, amount: Math.abs(t.amount) }));
}

export const analyzeStatement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    let txns: RawTransaction[] = data.transactions ?? [];

    // OCR path for scanned PDFs
    if ((!txns.length || data.pdfBase64) && data.pdfBase64) {
      try {
        txns = await ocrPdfToTransactions(data.pdfBase64);
      } catch (e) {
        return {
          candidates: [] as RecurringCandidate[],
          transactionCount: 0,
          error: e instanceof Error ? e.message : "Failed to OCR PDF",
        };
      }
    }

    if (!txns.length) {
      return {
        candidates: [] as RecurringCandidate[],
        transactionCount: 0,
        error: "No transactions could be extracted from the file.",
      };
    }

    const recurring = detectRecurring(txns);
    if (!recurring.length) {
      return { candidates: [], transactionCount: txns.length, error: null };
    }

    // Pull existing active subs to flag duplicates and link price-change matches.
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id,name,cost")
      .eq("status", "active");

    type ExistingSub = { id: string; name: string; cost: number };
    const existingSubs: ExistingSub[] = (existing ?? []).map((r) => ({
      id: r.id as string,
      name: r.name as string,
      cost: Number(r.cost),
    }));

    const cleanup = await cleanupWithAI(recurring);

    const finalCandidates: RecurringCandidate[] = recurring.map((c) => {
      const cleaned = cleanup.get(c.name);
      const finalName = cleaned?.matchedPresetName || cleaned?.cleanedName || c.name;
      const finalCategory =
        SERVICE_PRESETS.find((p) => p.name === finalName)?.category ??
        cleaned?.category ??
        "other";
      const match = matchExistingSubscription(
        { cleanName: finalName, rawDescriptor: c.raw, presetName: cleaned?.matchedPresetName ?? null },
        existingSubs,
      );
      return {
        ...c,
        name: finalName,
        category: finalCategory,
        alreadyTracked: !!match,
        matchedSubscriptionId: match?.id,
        matchedSubscriptionName: match?.name,
        matchedSubscriptionCost: match?.cost,
        matchScore: match?.score,
      };
    });

    return { candidates: finalCandidates, transactionCount: txns.length, error: null };
  });

/**
 * Normalize a merchant / subscription name for fuzzy comparison.
 * Strips punctuation, common payment-processor noise (e.g. "PAYPAL *"),
 * trailing IDs / city codes, plan suffixes ("PREMIUM", "PLUS"),
 * and collapses whitespace. Returns "" for empty input.
 */
function normalizeName(input: string): string {
  if (!input) return "";
  let s = input.toLowerCase();
  s = s.replace(/^(paypal|sq|sp|tst|pos|dd|gp|google|apl|apple\.com\/bill)[\s*\-:]+/i, "");
  s = s.replace(/\s+\d{4,}.*$/, "");
  s = s.replace(/\b(premium|plus|pro|family|individual|basic|monthly|yearly|annual|subscription|membership|sub|inc|llc|ltd|co|corp|com|usa|us|uk)\b/g, "");
  s = s.replace(/[^a-z0-9]+/g, " ").trim();
  return s;
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

/**
 * Score how confident we are that a candidate matches an existing subscription.
 * 0–100. Strong bias toward canonical preset matches, then fuzzy name
 * matching against the cleaned candidate and raw bank descriptor.
 */
function scoreMatch(
  candidate: { cleanName: string; rawDescriptor: string; presetName: string | null },
  sub: { name: string },
): number {
  const subPreset = SERVICE_PRESETS.find((p) => p.name.toLowerCase() === sub.name.toLowerCase());
  const candPreset = candidate.presetName;

  // 1. Both resolve to the same canonical preset → certain match.
  if (subPreset && candPreset && subPreset.name === candPreset) return 100;

  const subN = normalizeName(sub.name);
  const candN = normalizeName(candidate.cleanName);
  if (!subN || !candN) return 0;

  // 2. Exact normalized match.
  if (subN === candN) return 95;

  // 3. One contains the other ("netflix" ⊂ "netflix premium").
  if (subN.length >= 3 && candN.length >= 3 && (subN.includes(candN) || candN.includes(subN))) {
    return 88;
  }

  // 4. Fuzzy edit-distance similarity.
  const longer = Math.max(subN.length, candN.length);
  const sim = 1 - editDistance(subN, candN) / longer;
  if (sim >= 0.85) return Math.round(sim * 90);

  // 5. Last resort: brand name embedded in raw descriptor.
  const rawN = normalizeName(candidate.rawDescriptor);
  if (rawN && subN.length >= 4 && rawN.includes(subN)) return 80;

  return 0;
}

function matchExistingSubscription(
  candidate: { cleanName: string; rawDescriptor: string; presetName: string | null },
  existing: { id: string; name: string; cost: number }[],
): { id: string; name: string; cost: number; score: number } | null {
  let best: { id: string; name: string; cost: number; score: number } | null = null;
  for (const sub of existing) {
    const score = scoreMatch(candidate, sub);
    if (score >= 80 && (!best || score > best.score)) {
      best = { id: sub.id, name: sub.name, cost: sub.cost, score };
    }
  }
  return best;
}
