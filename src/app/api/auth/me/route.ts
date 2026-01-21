import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }

  const user = await User.findById(payload.userId).select("-password");

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    { status: 200 }
  );
}
