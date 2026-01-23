import { getAdminUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Complaint from "@/models/Complaint";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    if (!getAdminUser(req)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const complaints = await Complaint.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    console.error("Error fetching admin complaints:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
        if (!getAdminUser(req)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id, status } = await req.json();
        
        await dbConnect();

        const complaint = await Complaint.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        ).populate("user", "name email");

        if (!complaint) {
            return NextResponse.json({ message: "Complaint not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, complaint });

    } catch (error) {
        console.error("Error updating complaint:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}
