import Stripe from "stripe";

// Stripe client — initialized with placeholder when key is missing.
// ALL call-sites MUST guard with isStripeConfigured() before using stripe.*
const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";

export const stripe = new Stripe(stripeKey || "sk_test_placeholder_not_configured", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

/** Returns true only when STRIPE_SECRET_KEY is set and non-empty. */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Returns the stripe client only if configured.
 * Throws a clear error at call-time if Stripe is not configured.
 */
export function requireStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Set this env var to enable Stripe payments.");
  }
  return stripe;
}

export function priceId(): string {
  const id = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  if (!id) throw new Error("NEXT_PUBLIC_STRIPE_PRICE_ID is not set");
  return id;
}
