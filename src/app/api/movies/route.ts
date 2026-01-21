import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Movie from "@/models/Movie";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const search = req.nextUrl.searchParams.get("search");
    const query = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const movies = await Movie.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: movies });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch movies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const token = req.cookies.get("auth-token")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const movie = await Movie.create(body);
    return NextResponse.json({ success: true, data: movie }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create movie" }, { status: 400 });
  }
}
