import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Build a deterministic, per-user-session channel topic.
 * Same user + same purpose => same name across the app.
 *
 * Example: realtimeTopic("subscriptions", userId) => "subscriptions:<uuid>"
 */
export function realtimeTopic(purpose: string, userId: string): string {
  return `${purpose}:${userId}`;
}

/**
 * Create (or recreate) a realtime channel by topic.
 *
 * Why this exists: Supabase's client keeps channels in a global registry
 * keyed by topic. If a previous mount left a channel with the same name
 * still attached (StrictMode double-mount, fast refresh, navigation race),
 * calling `.on("postgres_changes", …)` on a fresh channel with that topic
 * throws: "cannot add postgres_changes callbacks after subscribe()".
 *
 * This helper looks up any existing channel with the same topic, removes
 * it, and returns a fresh one — so callers can use deterministic names
 * without ever accumulating duplicate listeners.
 */
export function createRealtimeChannel(topic: string): RealtimeChannel {
  const existing = supabase.getChannels().find((c) => c.topic === `realtime:${topic}` || c.topic === topic);
  if (existing) {
    supabase.removeChannel(existing);
  }
  return supabase.channel(topic);
}
