import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { message: "Payment reference is required" },
        { status: 400 }
      );
    }

    // verify payment with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json(
        { message: "Payment verification failed" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if bookings are already confirmed to avoid redundant updates
    const existingBookings = await Booking.find({ paymentIntentId: reference });
    
    if (existingBookings.length === 0) {
        return NextResponse.json(
            { message: "No bookings found for this reference" },
            { status: 404 }
        );
    }

    // Check if already confirmed
    const allConfirmed = existingBookings.every(b => b.status === 'confirmed');
    if (allConfirmed) {
         return NextResponse.json({
            success: true,
            message: "Payment already verified",
            bookings: existingBookings
        });
    }

    // Update bookings with confirmed status AND the verified email
    const result = await Booking.updateMany(
      { paymentIntentId: reference },
      { 
          $set: { 
              status: "confirmed",
              userEmail: verifyData.data.customer.email 
          } 
      }
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified and bookings confirmed",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
