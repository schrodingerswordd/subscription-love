import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createStripeCheckoutSession, createPublicStripeCheckoutSession } from "@/server/stripe.functions";
import { toast } from "sonner";

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const createSession = useServerFn(createStripeCheckoutSession);

  const openCheckout = async (options: {
    priceId?: string;
    priceData?: any;
    mode?: "subscription" | "payment";
    successUrl?: string;
    cancelUrl?: string;
  }) => {
    setLoading(true);
    try {
      const { url } = await createSession({
        data: {
          priceId: options.priceId,
          priceData: options.priceData,
          mode: options.mode || "subscription",
          successUrl: options.successUrl || `${window.location.origin}/app?upgraded=1`,
          cancelUrl: options.cancelUrl || window.location.href,
        },
      });

      if (url) {
        window.location.href = url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (e) {
      console.error("Stripe checkout failed", e);
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}

export function usePublicStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const createSession = useServerFn(createPublicStripeCheckoutSession);

  const openCheckout = async (options: {
    priceId?: string;
    priceData?: any;
    mode?: "subscription" | "payment";
    successUrl?: string;
    cancelUrl?: string;
  }) => {
    setLoading(true);
    try {
      const { url } = await createSession({
        data: {
          priceId: options.priceId,
          priceData: options.priceData,
          mode: options.mode || "subscription",
          successUrl: options.successUrl || `${window.location.origin}/signup?upgraded=1`,
          cancelUrl: options.cancelUrl || window.location.href,
        },
      });

      if (url) {
        window.location.href = url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (e) {
      console.error("Stripe checkout failed", e);
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}
