import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const { bookingId } = await req.json();
        
        const booking = await Booking.findById(bookingId).populate('movie', 'title');

        if (!booking) {
             return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: booking });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
    }
}
