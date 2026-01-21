import dbConnect from "@/lib/db";
import Concession from "@/models/Concession";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const concessions = await Concession.find({});
    return NextResponse.json({ success: true, data: concessions });
  } catch (error) {
    console.error("Error fetching concessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch concessions" },
      { status: 500 }
    );
  }
}
