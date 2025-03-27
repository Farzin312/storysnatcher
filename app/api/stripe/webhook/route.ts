// File: /pages/api/webhook.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/app/utils/stripe";
import { supabase } from "@/app/utils/client";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  let event: Stripe.Event;
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }
  const buf = await req.text();

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  switch (event.type as string) {
    case "checkout.session.completed": {
      // User purchased a subscription.
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string;
      const stripeCustomerId = session.customer as string;

      // Find the membership by stripe_customer_id.
      const { data: membership, error: membershipError } = await supabase
        .from("memberships")
        .select("*")
        .eq("stripe_customer_id", stripeCustomerId)
        .single();

      if (!membershipError && membership) {
        // e.g., membership.tier might be "Free", "Gold", or "Diamond"
        const oldTier = membership.tier;
        // If your session includes metadata with a new tier, use that;
        // otherwise default to "Gold" if oldTier was "Free", or keep oldTier.
        const newTier = session.metadata?.tier || (oldTier === "Free" ? "Gold" : oldTier);

        // (Optional) If user is upgrading from Free to a paid tier, reset usage
        if (oldTier === "Free" && newTier !== "Free") {
          await supabase
            .from("usage_limits")
            .update({
              transcription_minutes: 0,
              youtube_transcriptions: 0,
              flashcard_generations: 0,
              flashcard_saves: 0,
              quiz_generations: 0,
              quiz_saves: 0,
              cycle_start: new Date().toISOString(),
            })
            .eq("firebase_uid", membership.firebase_uid);
        }

        // Update membership record
        await supabase
          .from("memberships")
          .update({
            stripe_subscription_id: subscriptionId,
            tier: newTier,
          })
          .eq("stripe_customer_id", stripeCustomerId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      // Optionally handle subscription updates here
      break;
    }

    case "customer.subscription.deleted":
    case "customer.subscription.canceled": {
      // When the subscription is canceled, revert to "Free".
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("memberships")
        .update({ tier: "Free" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
