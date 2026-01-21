import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Movie from "@/models/Movie";
import { NextRequest, NextResponse } from "next/server";

import { isValidObjectId } from "mongoose";

// GET: Get single movie
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  try {
    const query = isValidObjectId(id) ? { _id: id } : { slug: id };
    const movie = await Movie.findOne(query);
    
    if (!movie) {
      return NextResponse.json({ success: false, error: "Movie not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: movie });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch movie" }, { status: 500 });
  }
}

// PUT: Update movie (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  const token = req.cookies.get("auth-token")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const movie = await Movie.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return NextResponse.json({ success: false, error: "Movie not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: movie });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update movie" }, { status: 400 });
  }
}

// DELETE: Delete movie (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  const token = req.cookies.get("auth-token")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
      return NextResponse.json({ success: false, error: "Movie not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete movie" }, { status: 500 });
  }
}
