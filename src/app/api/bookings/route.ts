import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Movie from '@/models/Movie';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  await dbConnect();

  const token = req.cookies.get("auth-token")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.role !== "admin") {
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
          { _id: { $regex: search, $options: "i" } } // Maybe support ID search too? usually MongoIDs are hex but regex works on string rep in mongoose often or fails. Safe to keep string fields.
          // Note: _id is ObjectId, regex might not work directly. Let's skip _id regex for now unless we cast. 
          // We can try exact match if it looks like an ID.
      ];
  }

  try {
     // Ensure Movie model is registered for populate
     const _ = Movie;

    const bookings = await Booking.find(query)
        .populate({ path: 'movie', select: 'title posterUrl', strictPopulate: false })
        .sort({ createdAt: -1 })
        .lean();
    
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Failed to fetch bookings", error)
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
        // Calculate total price for this item
        const seatsCost = item.seats.length * item.price;
        const snacksCost = item.concessions.reduce((acc: number, c: any) => acc + (c.price * c.quantity), 0);
        const totalPrice = seatsCost + snacksCost;

        bookings.push({
            user: item.user || null, // If user is logged in
            userEmail: guestDetails.email, // Save email for association
            guestDetails: guestDetails || null,
            movie: item.movieId,
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
            paymentIntentId: paymentReference, // We use this to group them and verify payment
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
