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

  // Cast event.type to string to avoid union type issues.
  switch (event.type as string) {
    case "checkout.session.completed": {
      // User purchased a subscription.
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string;
      const stripeCustomerId = session.customer as string;

      // Find membership row by stripe_customer_id.
      const { data: membership } = await supabase
        .from("memberships")
        .select("*")
        .eq("stripe_customer_id", stripeCustomerId)
        .single();

      if (membership) {
        // Update membership: if the current tier is "free", set it to "gold" (or parse from session).
        await supabase
          .from("memberships")
          .update({
            stripe_subscription_id: subscriptionId,
            tier: membership.tier === "free" ? "gold" : membership.tier,
          })
          .eq("stripe_customer_id", stripeCustomerId);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      // Optionally handle subscription updates.
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.canceled": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("memberships")
        .update({ tier: "free" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
