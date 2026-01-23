import { getUserFromRequest } from "@/lib/auth";
import dbConnect from "@/lib/db";
import logger from "@/lib/logger";
import Booking from "@/models/Booking";
import Movie from "@/models/Movie";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const payload = getUserFromRequest(req);
    
    if (!payload?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Get full user to find email
    const user = await User.findById(payload.userId);
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    logger.info(`Fetching bookings for user: ${user.email}`);

    // Ensure Movie model is registered
    const _ = Movie;

    // Fetch bookings for this user by EMAIL
    // Use strictPopulate: false as a safeguard against schema mismatches, and lean objects.
    const bookings = await Booking.find({ userEmail: user.email })
      .sort({ createdAt: -1 })  
      .populate({ path: 'movie', select: 'title posterUrl', strictPopulate: false })
      .lean();
    
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    logger.error("Error fetching user bookings:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
