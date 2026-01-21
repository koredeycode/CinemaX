import dbConnect from "@/lib/db";
import Showtime from "@/models/Showtime";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  try {
    const showtime = await Showtime.findById(id).populate("movie");
    if (!showtime) {
      return NextResponse.json({ success: false, error: "Showtime not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: showtime });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch showtime" }, { status: 500 });
  }
}
