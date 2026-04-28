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

    // Pull existing active subs to flag duplicates
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("name")
      .eq("status", "active");
    const existingNames = new Set(
      (existing ?? []).map((r) => (r.name as string).toLowerCase().trim()),
    );

    const cleanup = await cleanupWithAI(recurring);

    const finalCandidates: RecurringCandidate[] = recurring.map((c) => {
      const cleaned = cleanup.get(c.name);
      const finalName = cleaned?.matchedPresetName || cleaned?.cleanedName || c.name;
      const finalCategory =
        SERVICE_PRESETS.find((p) => p.name === finalName)?.category ??
        cleaned?.category ??
        "other";
      return {
        ...c,
        name: finalName,
        category: finalCategory,
        alreadyTracked: existingNames.has(finalName.toLowerCase().trim()),
      };
    });

    return { candidates: finalCandidates, transactionCount: txns.length, error: null };
  });
