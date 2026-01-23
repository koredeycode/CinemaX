import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get("movieId");
    const date = searchParams.get("date");
    const time = searchParams.get("time");

    if (!movieId || !date || !time) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }

    // Find all bookings for this movie slot that are CONFIRMED or PENDING
    // Pending bookings hold the seat for a short while (clean up job needed in real app)
    const bookings = await Booking.find({
      movie: movieId,
      date,
      time,
      status: { $in: ["confirmed", "pending"] }
    }).select("seats");

    // Flatten all seats into a single array
    const bookedSeats = bookings.flatMap(b => b.seats);

    return NextResponse.json({ success: true, bookedSeats });
  } catch (error) {
    console.error("Availability check failed:", error);
    return NextResponse.json({ success: false, error: "Failed to check availability" }, { status: 500 });
  }
}
