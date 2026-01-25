import { getAdminUser, getUserFromRequest } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ refId: string }> }
) {
    const params = await props.params;
    await dbConnect();
    const { refId } = params;

    try {
        // Ensure Movie model is registered


        const booking = await Booking.findOne({ referenceId: refId })
            .populate({ path: 'movieId', select: 'title posterUrl', strictPopulate: false })
            .lean() as any;
        

        
        if (!booking) {
            return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
        }

        const userPayload = getUserFromRequest(req);
        const isAdmin = getAdminUser(req);
        
        // Strict Security: All bookings require authentication to view via API
        if (!userPayload && !isAdmin) {
             return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Check ownership:
        // 1. If admin, allow.
        // 2. If logged in user matches booking.user, allow.
        
        const isOwner = userPayload && booking.user && booking.user.toString() === userPayload.userId;

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        return NextResponse.json({ success: true, booking });

    } catch (error) {
        console.error("Error fetching booking:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
