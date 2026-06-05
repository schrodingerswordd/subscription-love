import { loadStripe, Stripe } from "@stripe/stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!publishableKey) {
    throw new Error("VITE_STRIPE_PUBLISHABLE_KEY is not set");
  }
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};
