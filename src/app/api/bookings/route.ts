import { getAdminUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { RateLimiter } from "@/lib/ratelimit";
import Booking from '@/models/Booking';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  await dbConnect();

  if (!getAdminUser(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const query: any = {};
  if (search) {
      query.$or = [
          { userEmail: { $regex: search, $options: "i" } },
          { "guestDetails.name": { $regex: search, $options: "i" } },
          { "guestDetails.email": { $regex: search, $options: "i" } },
          { _id: { $regex: search, $options: "i" } }
      ];
  }

  try {


    const bookings = await Booking.find(query)
        .populate({ path: 'movieId', select: 'title posterUrl', strictPopulate: false })
        .sort({ createdAt: -1 })
        .lean();
    
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Failed to fetch bookings", error)
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") as string) || "127.0.0.1";
  const isAllowed = await RateLimiter.checkLimit(ip, "create-booking", 10, 60);

  if (!isAllowed) {
    return NextResponse.json(
      { success: false, message: "Too many bookings created. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    await dbConnect();
    
    const body = await req.json();
    const { cart, guestDetails, paymentReference } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    if (!paymentReference) {
        return NextResponse.json({ success: false, message: "Payment reference is required" }, { status: 400 });
    }
    
    const bookings = [];

    // Create a Booking document for each item in the cart
    for (const item of cart) {
        // --- Security Check: Check-and-Set ---
        // Verify that none of these seats are already booked.
        // This is the final source of truth, overruling any socket locks.
        const existingBooking = await Booking.findOne({
            movieId: item.movieId,
            date: item.date,
            time: item.time,
            status: { $in: ['confirmed', 'pending'] },
            seats: { $in: item.seats }
        });

        if (existingBooking) {
            // Find which seats are taken
            const takenSeats = item.seats.filter((s: string) => existingBooking.seats.includes(s));
            return NextResponse.json({ 
                success: false, 
                message: `Booking failed. The following seats were just taken: ${takenSeats.join(', ')}`,
                errorType: 'SEAT_TAKEN'
            }, { status: 409 });
        }
        // -------------------------------------

        // Calculate total price for this item
        const seatsCost = item.seats.length * item.price;
        const snacksCost = item.concessions.reduce((acc: number, c: any) => acc + (c.price * c.quantity), 0);
        const totalPrice = seatsCost + snacksCost;

        bookings.push({
            user: item.user || null, // If user is logged in
            userEmail: guestDetails.email, // Save email for association
            guestDetails: guestDetails || null,
            movieId: item.movieId,
            date: item.date,
            time: item.time,
            seats: item.seats,
            foodDetails: item.concessions.map((c: any) => ({
                id: c.id,
                name: c.name,
                qty: c.quantity,
                cost: c.price
            })),
            totalPrice,
            status: 'pending',
            referenceId: paymentReference,
        });
    }

    await Booking.insertMany(bookings);

    return NextResponse.json({ 
        success: true, 
        reference: paymentReference 
    });

  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
