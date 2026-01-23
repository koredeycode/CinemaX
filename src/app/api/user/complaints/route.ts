import { getUserFromRequest } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Complaint from "@/models/Complaint";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";


const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecretjwtkeychangeinprod"
);

async function getUserId(req: Request) {
  const token = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("auth-token="))?.split("=")[1];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.id as string;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const payload = getUserFromRequest(req);
    
     if (!payload?.userId) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

    const { subject, message } = await req.json();

    if (!subject || !message) {
        return NextResponse.json({ message: "Subject and message are required" }, { status: 400 });
    }

    await dbConnect();
    
    const complaint = await Complaint.create({
        user: payload.userId,
        subject,
        message
    });

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
    try {
      const payload = getUserFromRequest(req);
      
       if (!payload?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
          }
  
      await dbConnect();
      
      const complaints = await Complaint.find({ user: payload.userId }).sort({ createdAt: -1 });
  
      return NextResponse.json({ success: true, complaints });
    } catch (error) {
      console.error("Error fetching complaints:", error);
      return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
  }
