import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    
    // Case-insensitive check
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    return NextResponse.json({ 
        exists: !!user,
        message: user ? "User exists" : "User available" 
    });

  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
