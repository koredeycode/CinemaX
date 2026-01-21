import dbConnect from "@/lib/db";
import Complaint from "@/models/Complaint";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecretjwtkeychangeinprod"
);

// Admin check helper
async function isAdmin(req: Request) {
  const token = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("auth-token="))?.split("=")[1];
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  try {
    if (!(await isAdmin(req))) {
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
        if (!(await isAdmin(req))) {
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
