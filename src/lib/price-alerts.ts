import { supabase } from "@/integrations/supabase/client";

export type PriceSource = "manual_edit" | "scan" | "initial";

/**
 * Record a price observation for a subscription. The DB trigger
 * compares against the previous record and creates a price_alerts row
 * automatically when the change crosses the subscription's threshold.
 *
 * Safe to call even if cost is unchanged — the trigger short-circuits.
 */
export async function recordPrice(opts: {
  subscriptionId: string;
  userId: string;
  cost: number;
  source: PriceSource;
}) {
  const { error } = await supabase.from("price_history").insert({
    subscription_id: opts.subscriptionId,
    user_id: opts.userId,
    cost: opts.cost,
    source: opts.source,
  });
  if (error) {
    // Non-fatal — log but don't break the main save flow.
    console.warn("recordPrice failed", error);
  }
}
