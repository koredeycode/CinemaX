import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import logger from "./logger";
import redis from "./redis.ts";

export function initSocket(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    socket.on("join-showtime", async (showtimeId: string) => {
      socket.join(showtimeId);
      logger.debug(`Socket ${socket.id} joined showtime ${showtimeId}`);
      
      // Send current locked seats to the user
      // In a real app, we'd fetch this from Redis
    });

    socket.on("select-seat", async ({ showtimeId, seatLabel, userId }: { showtimeId: string, seatLabel: string, userId: string }) => {
        // Lock seat in Redis
        // Key: showtime:{id}:seat:{label}
        const lockKey = `lock:showtime:${showtimeId}:seat:${seatLabel}`;
        const isLocked = await redis.get(lockKey);
        
        if (isLocked) {
             socket.emit("seat-error", { message: "Seat already selected" });
             return;
        }

        // Set lock for 5 minutes (300 seconds)
        await redis.set(lockKey, userId, "EX", 300);
        
        // Broadcast to room
        io.to(showtimeId).emit("seat-locked", { seatLabel, userId });
    });

    socket.on("release-seat", async ({ showtimeId, seatLabel }: { showtimeId: string, seatLabel: string }) => {
        const lockKey = `lock:showtime:${showtimeId}:seat:${seatLabel}`;
        await redis.del(lockKey);
        
        io.to(showtimeId).emit("seat-released", { seatLabel });
    });

    socket.on("disconnect", () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}
