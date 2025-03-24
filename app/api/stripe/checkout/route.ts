import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/utils/client";
import { verifyFirebaseToken } from "@/app/utils/firebase-server";

// Instead of using Price IDs, we now use Payment Link URLs from environment variables.
const PAYMENT_LINK_GOLD = process.env.STRIPE_PAYMENT_LINK_GOLD!;
const PAYMENT_LINK_DIAMOND = process.env.STRIPE_PAYMENT_LINK_DIAMOND!;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Parse the request body (expecting JSON with a "tier" property)
    const { tier } = await req.json();

    // 2. Retrieve the Firebase ID token from the Authorization header.
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const uid = await verifyFirebaseToken(token);
    if (!uid) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 3. Retrieve the membership record from Supabase using the Firebase UID.
    const { data: existingMembership, error: membershipError } = await supabase
      .from("memberships")
      .select("*")
      .eq("firebase_uid", uid)
      .single();
    let membership = existingMembership;
    if (membershipError || !membership) {
      const { data: newMembership } = await supabase
        .from("memberships")
        .insert({ firebase_uid: uid, tier: "free" })
        .select()
        .single();
      membership = newMembership;
    }

    // 4. Decide which Payment Link to use based on the requested tier.
    let paymentLink: string;
    if (tier === "gold") {
      paymentLink = PAYMENT_LINK_GOLD;
    } else if (tier === "diamond") {
      paymentLink = PAYMENT_LINK_DIAMOND;
    } else {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // 5. Return the Payment Link URL.
    return NextResponse.json({ url: paymentLink }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Checkout error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
