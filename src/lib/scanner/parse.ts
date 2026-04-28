// Client-side parsers for bank statement uploads (CSV + PDF text).
// Scanned PDFs (image-only) are detected and forwarded to the server for OCR.

import Papa from "papaparse";
import type { RawTransaction } from "./types";

/* ----------------------------- CSV PARSING ----------------------------- */

const DATE_HEADERS = ["date", "transaction date", "posted date", "posting date", "trans date"];
const DESC_HEADERS = ["description", "details", "merchant", "name", "memo", "narrative", "payee"];
const AMOUNT_HEADERS = ["amount", "debit", "withdrawal", "charge", "value"];

function findKey(row: Record<string, string>, candidates: string[]): string | undefined {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const k = keys.find((k) => k.trim().toLowerCase() === c);
    if (k) return k;
  }
  // fallback: contains
  for (const c of candidates) {
    const k = keys.find((k) => k.trim().toLowerCase().includes(c));
    if (k) return k;
  }
  return undefined;
}

function toIsoDate(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  // Try native first
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  // DD/MM/YYYY or MM/DD/YYYY
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    const [, a, b, y] = m;
    const year = y.length === 2 ? 2000 + Number(y) : Number(y);
    // Assume MM/DD/YYYY (US bank format) — best-effort.
    const d2 = new Date(year, Number(a) - 1, Number(b));
    if (!isNaN(d2.getTime())) return d2.toISOString().slice(0, 10);
  }
  return null;
}

function parseAmount(raw: string): number | null {
  if (!raw) return null;
  // Strip currency symbols, commas, parentheses (negative), spaces
  const neg = /^\(.*\)$/.test(raw.trim()) || raw.trim().startsWith("-");
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (isNaN(n)) return null;
  return neg ? -n : n;
}

export function parseCsv(text: string): RawTransaction[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  if (!result.data.length) return [];
  const sample = result.data[0];
  const dateKey = findKey(sample, DATE_HEADERS);
  const descKey = findKey(sample, DESC_HEADERS);
  const amountKey = findKey(sample, AMOUNT_HEADERS);
  if (!dateKey || !descKey || !amountKey) {
    throw new Error(
      "CSV is missing one of: date, description, amount. Re-export from your bank with column headers.",
    );
  }
  const out: RawTransaction[] = [];
  for (const row of result.data) {
    const date = toIsoDate(row[dateKey] ?? "");
    const description = (row[descKey] ?? "").trim();
    const amount = parseAmount(row[amountKey] ?? "");
    if (!date || !description || amount === null) continue;
    // Bank statements often store debits as negative. We track positive charge size.
    out.push({ date, description, amount: Math.abs(amount) });
  }
  return out;
}

/* ----------------------------- PDF PARSING ----------------------------- */

/**
 * Extracts text from a PDF in-browser using pdfjs-dist. Returns the joined
 * text and a flag indicating whether the PDF appeared to be image-only
 * (so the caller can fall back to server-side OCR).
 */
export async function extractPdfText(
  file: File,
): Promise<{ text: string; looksScanned: boolean; pageCount: number }> {
  // Lazy import: pdfjs is heavy and only needed when user uploads a PDF.
  const pdfjs = await import("pdfjs-dist");
  // Vite-friendly worker URL
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it: any) => ("str" in it ? it.str : "")).filter(Boolean);
    text += strings.join(" ") + "\n";
  }
  // If text density is essentially zero, we assume it's a scanned PDF.
  const looksScanned = text.replace(/\s+/g, "").length < 40;
  return { text, looksScanned, pageCount: doc.numPages };
}

/**
 * Best-effort line-based extraction of transactions from raw PDF text.
 * Looks for lines containing a date and a money amount.
 */
export function extractTransactionsFromText(text: string): RawTransaction[] {
  const lines = text.split(/\r?\n/);
  const out: RawTransaction[] = [];
  // Date patterns: 01/15/2025, 01-15-25, 2025-01-15, Jan 15, 2025
  const dateRe =
    /\b(\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})\b/i;
  // Money: $12.99, 12.99, (12.99), 1,234.56
  const moneyRe = /[-(]?\$?\d{1,3}(?:,\d{3})*\.\d{2}\)?/g;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length < 8) continue;
    const dateMatch = line.match(dateRe);
    if (!dateMatch) continue;
    const moneyMatches = line.match(moneyRe);
    if (!moneyMatches?.length) continue;
    const date = toIsoDate(dateMatch[1]);
    if (!date) continue;
    // Pick the LAST money on the line (usually the transaction amount, not balance).
    // But if there are 2+, prefer the smaller-magnitude one as the txn amount.
    const amounts = moneyMatches
      .map((m) => parseAmount(m))
      .filter((n): n is number => n !== null);
    if (!amounts.length) continue;
    const amt = amounts.length >= 2
      ? amounts.reduce((a, b) => (Math.abs(a) <= Math.abs(b) ? a : b))
      : amounts[0];
    // Description = the line with date + money stripped
    let desc = line.replace(dateMatch[0], " ");
    for (const m of moneyMatches) desc = desc.replace(m, " ");
    desc = desc.replace(/\s+/g, " ").trim();
    if (!desc || desc.length < 3) continue;
    out.push({ date, description: desc, amount: Math.abs(amt) });
  }
  return out;
}
