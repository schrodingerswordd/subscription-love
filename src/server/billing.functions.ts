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

export type BillingHistoryItem = {
  id: string;
  invoiceNumber: string | null;
  status: string;
  billedAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  amount: string;
  currency: string;
  invoiceUrl: string | null;
};

export const getBillingHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => envSchema.parse(i))
  .handler(async ({ data, context }): Promise<{ items: BillingHistoryItem[] }> => {
    const { userId } = context;
    const { data: sub } = await supabaseAdmin
      .from("user_subscriptions")
      .select("paddle_customer_id")
      .eq("user_id", userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.paddle_customer_id) return { items: [] };

    const json = await paddleFetch(
      data.environment,
      `/transactions?customer_id=${sub.paddle_customer_id}&per_page=50&order_by=billed_at[DESC]`,
    );
    const txs: any[] = json?.data ?? [];

    const items = await Promise.all(
      txs.map(async (t): Promise<BillingHistoryItem> => {
        const total = t?.details?.totals?.total ?? "0";
        const currency = t?.currency_code ?? "USD";
        const amount = (Number(total) / 100).toFixed(2);
        let invoiceUrl: string | null = null;
        if (t?.id && (t.status === "completed" || t.status === "billed" || t.status === "paid")) {
          try {
            const inv = await paddleFetch(data.environment, `/transactions/${t.id}/invoice`);
            invoiceUrl = inv?.data?.url ?? null;
          } catch {
            invoiceUrl = null;
          }
        }
        return {
          id: t.id,
          invoiceNumber: t.invoice_number ?? null,
          status: t.status,
          billedAt: t.billed_at ?? t.created_at ?? null,
          periodStart: t?.billing_period?.starts_at ?? null,
          periodEnd: t?.billing_period?.ends_at ?? null,
          amount,
          currency,
          invoiceUrl,
        };
      }),
    );

    return { items };
  });
