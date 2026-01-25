import { getAdminUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    if (!getAdminUser(req)) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    try {
        const { refId } = await req.json();
        


        // Strict lookup by referenceId
        const query = { referenceId: refId };

        const booking = await Booking.findOne(query)
            .populate({ path: 'movieId', select: 'title', strictPopulate: false })
            .lean();

        if (!booking) {
             return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: booking });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
    }
}
