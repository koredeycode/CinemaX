
import logger from "@/lib/logger";
import redis from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { seats, movieId, date, time } = await req.json();

        if (!seats || !Array.isArray(seats) || !movieId || !date || !time) {
            return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
        }

        const showtimeId = `${movieId}:${date}:${time}`;
        let releaseCount = 0;

        for (const seatLabel of seats) {
            const lockKey = `lock:showtime:${showtimeId}:seat:${seatLabel}`;
            const deleted = await redis.del(lockKey);
            if (deleted) {
                releaseCount++;
                // Publish release event for socket server
                await redis.publish("seat-releases", JSON.stringify({ showtimeId, seatLabel }));
            }
        }

        logger.info(`Released ${releaseCount} seats for showtime ${showtimeId}`);

        return NextResponse.json({ success: true, released: releaseCount });
    } catch (error) {
        logger.error("Error releasing seats:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
