import { getAdminUser, getUserFromRequest } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Movie from "@/models/Movie";
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
        const _ = Movie;

        const booking = await Booking.findOne({ referenceId: refId })
            .populate({ path: 'movieId', select: 'title posterUrl', strictPopulate: false })
            .lean() as any;
        

        
        if (!booking) {
            return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
        }

        // Security: Ensure the user owns this booking if they are logged in, 
        // OR if it's a guest booking, maybe we allow public access via the Ref ID (common for guest checkout)?
        // For now, mirroring the ticket access logic: if it has a user, check auth.
        // If it's a guest booking (no user), the Ref ID serves as the "key".
        
        if (booking.user) {
            const userPayload = getUserFromRequest(req);
            // Allow if admin or owner
            const isAdmin = getAdminUser(req);
            
            if (!isAdmin && (!userPayload || userPayload.userId !== booking.user.toString())) {
                return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
            }
        }

        return NextResponse.json({ success: true, booking });

    } catch (error) {
        console.error("Error fetching booking:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
