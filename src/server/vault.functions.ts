import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// --- VAULT ACCESS PORTAL LOGIC ---

export const getLibraryAssets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // 1. Get user's subscription status
    const { data: sub } = await supabaseAdmin
      .from("user_subscriptions")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    const isPremium = sub?.status === "active" || sub?.status === "trialing";

    // 2. Get assets user has purchased or are included in premium
    const { data: assets, error } = await supabaseAdmin
      .from("vault_assets")
      .select(`
        *,
        user_assets!inner(user_id)
      `)
      .or(`is_premium_only.eq.${!isPremium},user_assets.user_id.eq.${userId}`);

    if (error) throw error;
    return { assets };
  });

// --- OPERATIONS DASHBOARD LOGIC ---

export const getInventoryMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth]) // In production, add Admin check
  .handler(async () => {
    const { data: items, error } = await supabaseAdmin
      .from("inventory_items")
      .select("*");

    if (error) throw error;

    const totalCost = items.reduce((acc, item) => acc + (Number(item.unit_cost) * item.quantity_on_hand), 0);
    const totalMSRP = items.reduce((acc, item) => acc + (Number(item.msrp) * item.quantity_on_hand), 0);
    const margin = totalMSRP > 0 ? ((totalMSRP - totalCost) / totalMSRP) * 100 : 0;

    const alerts = items.filter(item => item.status === "Low Stock" || item.quantity_on_hand < 50);

    return {
      metrics: {
        totalCost,
        totalMSRP,
        margin: margin.toFixed(2),
        itemCount: items.length,
      },
      alerts,
      items
    };
  });
