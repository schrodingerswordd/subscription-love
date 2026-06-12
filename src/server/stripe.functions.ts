import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27-acacia" as any,
});

const checkoutSchema = z.object({
  priceId: z.string().optional(),
  priceData: z.any().optional(),
  successUrl: z.string(),
  cancelUrl: z.string(),
  mode: z.enum(["subscription", "payment"]),
});

export const createStripeCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => checkoutSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { priceId, priceData, successUrl, cancelUrl, mode } = data;

    // Get user email
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !user.user) throw new Error("User not found");

    const line_item: any = { quantity: 1 };
    if (priceId) {
      line_item.price = priceId;
    } else if (priceData) {
      line_item.price_data = priceData;
    } else {
      throw new Error("Must provide priceId or priceData");
    }

    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [line_item],
      mode: mode as Stripe.Checkout.Session.Mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.user.email,
      metadata: {
        userId,
      },
    };

    if (mode === "payment") {
      sessionOptions.shipping_address_collection = {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "IT", "ES", "NL", "BE", "SE", "NO", "DK"],
      };
      sessionOptions.phone_number_collection = {
        enabled: true,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return { url: session.url };
  });

export const createPublicStripeCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((i) => checkoutSchema.parse(i))
  .handler(async ({ data }) => {
    const { priceId, priceData, successUrl, cancelUrl, mode } = data;

    const line_item: any = { quantity: 1 };
    if (priceId) {
      line_item.price = priceId;
    } else if (priceData) {
      line_item.price_data = priceData;
    } else {
      throw new Error("Must provide priceId or priceData");
    }

    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [line_item],
      mode: mode as Stripe.Checkout.Session.Mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    if (mode === "payment") {
      sessionOptions.shipping_address_collection = {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "IT", "ES", "NL", "BE", "SE", "NO", "DK"],
      };
      sessionOptions.phone_number_collection = {
        enabled: true,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return { url: session.url };
  });

export const createStripePortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data: sub } = await supabaseAdmin
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      throw new Error("No Stripe customer found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.VITE_SITE_URL || 'http://localhost:3000'}/app/billing`,
    });

    return { url: session.url };
  });
