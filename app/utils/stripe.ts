import Stripe from "stripe";

/**
 * Make sure you have STRIPE_SECRET_KEY set in your .env or environment variables.
 * This file is only imported on the server side, so your secret key stays safe.
 */
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
}

export const stripe = new Stripe(stripeSecretKey, {
  // Use the API version expected by the type definitions
  apiVersion: "2025-02-24.acacia",
});
