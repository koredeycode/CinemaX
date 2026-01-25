import logger from "@/lib/logger";
import { RateLimiter } from "@/lib/ratelimit";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const isAllowed = await RateLimiter.checkLimit(ip, "checkout", 10, 60);

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait a moment." },
        { status: 429 }
      );
    }
    const { amount } = await req.json();

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } else {
      // Mock mode
      logger.info("Mocking Stripe PaymentIntent creation");
      // Return a fake client secret if using a mock provider on frontend,
      // OR just return success: true to indicate we skip stripe.
      // However, the standard Stripe Elements flow requires a client secret.
      // If we don't have a key, we might need a workaround for the frontend to generic "success".
      
      // For this demo, let's assume if NO KEY, we assume we skip payment phase or use a dummy.
      // But keeping it realistic, we'll return a dummy string hoping the frontend handles "mock" mode.
      return NextResponse.json({ clientSecret: "mock_secret_" + Date.now() });
    }
  } catch (error) {
    logger.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Error creating payment intent" },
      { status: 500 }
    );
  }
}
