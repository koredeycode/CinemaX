import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { NextRequest, NextResponse } from "next/server";

import Movie from "@/models/Movie";

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const { bookingId } = await req.json();
        
        // Ensure Movie model is registered
        const _ = Movie;

        const booking = await Booking.findById(bookingId)
            .populate({ path: 'movie', select: 'title', strictPopulate: false })
            .lean();

        if (!booking) {
             return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: booking });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
    }
}
