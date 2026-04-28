// Shared types for the bank-statement scanner.

export interface RawTransaction {
  /** ISO date string (YYYY-MM-DD). */
  date: string;
  /** Raw merchant / description string from the statement. */
  description: string;
  /** Positive number representing the amount the user was charged (USD or local). */
  amount: number;
}

export interface RecurringCandidate {
  /** Cleaned, human-friendly merchant name (e.g. "Netflix"). */
  name: string;
  /** Original raw descriptor as it appeared on the statement. */
  raw: string;
  /** Median charge amount across detected occurrences. */
  amount: number;
  /** Detected billing cycle. */
  cycle: "weekly" | "monthly" | "yearly";
  /** Number of times the charge was seen in the file. */
  occurrences: number;
  /** ISO date of the most recent charge. */
  lastSeen: string;
  /** Suggested category from preset matching, or "other". */
  category: string;
  /** True when this merchant already exists in the user's active subs. */
  alreadyTracked: boolean;
}
