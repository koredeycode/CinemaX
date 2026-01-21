import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { NextResponse } from 'next/server';

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
            showtime: item.showtimeId,
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
