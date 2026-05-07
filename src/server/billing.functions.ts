import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type PaddleEnv = "sandbox" | "live";

const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev/paddle";

function getKey(env: PaddleEnv) {
  const k = env === "sandbox" ? process.env.PADDLE_SANDBOX_API_KEY : process.env.PADDLE_LIVE_API_KEY;
  if (!k) throw new Error(`Missing Paddle ${env} API key`);
  return k;
}

async function paddleFetch(env: PaddleEnv, path: string, init?: RequestInit) {
  const apiKey = getKey(env);
  const lovableKey = process.env.LOVABLE_API_KEY!;
  const res = await fetch(`${GATEWAY_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Connection-Api-Key": apiKey,
      "Lovable-API-Key": lovableKey,
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Paddle ${path} ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

const envSchema = z.object({ environment: z.enum(["sandbox", "live"]) });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => envSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: sub } = await supabaseAdmin
      .from("user_subscriptions")
      .select("paddle_customer_id, paddle_subscription_id")
      .eq("user_id", userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.paddle_customer_id) throw new Error("No subscription found");

    const body = {
      subscription_ids: sub.paddle_subscription_id ? [sub.paddle_subscription_id] : [],
    };
    const json = await paddleFetch(
      data.environment,
      `/customers/${sub.paddle_customer_id}/portal-sessions`,
      { method: "POST", body: JSON.stringify(body) },
    );
    const general = json?.data?.urls?.general?.overview;
    const subUrl = json?.data?.urls?.subscriptions?.[0]?.cancel_subscription;
    return { url: general || subUrl };
  });

export const cancelSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => envSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: sub } = await supabaseAdmin
      .from("user_subscriptions")
      .select("paddle_subscription_id, status")
      .eq("user_id", userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.paddle_subscription_id) throw new Error("No subscription found");

    await paddleFetch(
      data.environment,
      `/subscriptions/${sub.paddle_subscription_id}/cancel`,
      { method: "POST", body: JSON.stringify({ effective_from: "next_billing_period" }) },
    );
    return { ok: true };
  });
