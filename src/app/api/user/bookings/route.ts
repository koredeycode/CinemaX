import dbConnect from "@/lib/db";
import logger from "@/lib/logger";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecretjwtkeychangeinprod"
);

// Helper to get user ID from token
async function getUserId(req: Request) {
  const token = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("auth-token="))?.split("=")[1];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log({payload})
    return payload.userId as string;
  } catch {
    logger.error("Invalid token");
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getUserId(req);
    console.log({userId})
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Get full user to find email
    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log(`Fetching bookings for user: ${user.email}`);

    // Fetch bookings for this user by EMAIL
    const bookings = await Booking.find({ userEmail: user.email })
      .sort({ createdAt: -1 })  
      .populate({
         path: "showtime",
         populate: { path: "movie" } 
      });
    
      console.log({bookings})

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    logger.error("Error fetching user bookings:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
