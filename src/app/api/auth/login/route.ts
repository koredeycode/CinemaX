import { comparePassword, signForUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import logger from "@/lib/logger";
import User from "@/models/User";
import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password!);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signForUser(user);

    const cookie = serialize("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "strict",
    });

    const response = NextResponse.json(
      { success: true, user: { name: user.name, email: user.email, role: user.role }, token },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
