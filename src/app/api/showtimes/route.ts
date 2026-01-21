import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import logger from "@/lib/logger";
import Movie from "@/models/Movie";
import Showtime from "@/models/Showtime";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();
  
  const { searchParams } = new URL(req.url);
  const movieId = searchParams.get("movieId");
  const date = searchParams.get("date");

  const query: any = {};
  
  if (movieId) {
     if (mongoose.Types.ObjectId.isValid(movieId)) {
        query.movie = movieId;
     } else {
        const movie = await Movie.findOne({ slug: movieId });
        if (movie) {
            query.movie = movie._id;
        } else {
            return NextResponse.json({ success: true, data: [] });
        }
     }
  }

  if (date) {
    // Basic date filtering - assumes date string YYYY-MM-DD
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    query.startTime = { $gte: startOfDay, $lt: endOfDay };
  } else {
     // Default: only upcoming showtimes
    query.startTime = { $gt: new Date() };
  }

  try {
    const showtimes = await Showtime.find(query)
        .populate("movie", "title runtime")
        .sort({ startTime: 1 });
    return NextResponse.json({ success: true, data: showtimes });
  } catch (error) {
    logger.error("Error fetching showtimes", error);
    return NextResponse.json({ success: false, error: "Failed to fetch showtimes" }, { status: 500 });
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
    const showtime = await Showtime.create(body);
    return NextResponse.json({ success: true, data: showtime }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create showtime" }, { status: 400 });
  }
}
