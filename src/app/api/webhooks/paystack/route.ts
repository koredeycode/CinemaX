import dbConnect from "@/lib/db";
import logger from "@/lib/logger";
import Booking from "@/models/Booking";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = req.headers;
    const signature = headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret || !signature) {
        return NextResponse.json({ message: "Missing secret or signature" }, { status: 400 });
    }

    // Verify signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    const event = body.event;
    const data = body.data;

    // Handle successful charge
    if (event === "charge.success") {
        const reference = data.reference;
        const payerEmail = data.customer?.email;
        
        await dbConnect();

        // Update booking status and ensure email matches payer
        await Booking.updateMany(
            { paymentIntentId: reference },
            { 
                $set: { 
                    status: "confirmed",
                    userEmail: payerEmail 
                } 
            }
        );
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    logger.error("Webhook error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
