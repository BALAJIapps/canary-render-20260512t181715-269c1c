import Stripe from "stripe";

// Do NOT throw at module load — this file is imported during Next.js build
// page-data collection even when Stripe is not configured. Guard at call-time instead.
const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";

export const stripe = new Stripe(stripeKey || "sk_placeholder_not_configured", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function priceId(): string {
  const id = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  if (!id) throw new Error("NEXT_PUBLIC_STRIPE_PRICE_ID is not set");
  return id;
}
