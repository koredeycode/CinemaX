import { hashPassword, signForUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import logger from "@/lib/logger";
import { RateLimiter } from "@/lib/ratelimit";
import User from "@/models/User";
import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { name, email, password } = await req.json();

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const isAllowed = await RateLimiter.checkLimit(ip, "register", 3, 3600);

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

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
      { status: 201 }
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
