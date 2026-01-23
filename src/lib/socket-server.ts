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
      try {
          // Fetch keys matching pattern: lock:showtime:{id}:seat:*
          const pattern = `lock:showtime:${showtimeId}:seat:*`;
          let cursor = "0";
          const keys: string[] = [];
          
          do {
              const res = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
              cursor = res[0];
              keys.push(...res[1]);
          } while (cursor !== "0");

          if (keys.length > 0) {
              for (const key of keys) {
                  // Key format: lock:showtime:{id}:seat:{label}
                  const seatLabel = key.split(":").pop();
                  const userId = await redis.get(key);
                  
                  if (seatLabel && userId) {
                      socket.emit("seat-locked", { seatLabel, userId });
                  }
              }
          }
      } catch (error) {
          logger.error("Error fetching initial locks:", error);
      }
    });

    socket.on("select-seat", async ({ showtimeId, seatLabel, userId }: { showtimeId: string, seatLabel: string, userId: string }) => {
        // Check user's current lock count
        const pattern = `lock:showtime:${showtimeId}:seat:*`;
        let cursor = "0";
        let userLockCount = 0;
        
        try {
            do {
                const res = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
                cursor = res[0];
                const keys = res[1];
                
                if (keys.length > 0) {
                    // Pipeline get commands for efficiency
                    const pipeline = redis.pipeline();
                    keys.forEach(key => pipeline.get(key));
                    const results = await pipeline.exec();
                    
                    if (results) {
                        results.forEach((result) => {
                            if (result[1] === userId) userLockCount++;
                        });
                    }
                }
            } while (cursor !== "0");

            if (userLockCount >= 5) {
                socket.emit("seat-error", { message: "You can only select up to 5 seats" });
                return;
            }
        } catch (err) {
            logger.error("Error checking lock limit:", err);
            // Proceed cautiously or fail safe? Letting it slide for now to avoid blocking on redis error
        }

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

  // Redis Pub/Sub for API-triggered events
  const subRedis = redis.duplicate();
  subRedis.subscribe("seat-releases", (err) => {
      if (err) logger.error("Failed to subscribe to seat-releases channel:", err);
      else logger.info("Subscribed to seat-releases channel");
  });

  subRedis.on("message", (channel, message) => {
      logger.info(`[SocketServer] Received message on ${channel}: ${message}`);
      if (channel === "seat-releases") {
          try {
              const { showtimeId, seatLabel } = JSON.parse(message);
              if (showtimeId && seatLabel) {
                  io.to(showtimeId).emit("seat-released", { seatLabel });
                  logger.info(`[SocketServer] Broadcasted seat-released to room ${showtimeId}: ${seatLabel}`);
              } else {
                  logger.warn(`[SocketServer] Invalid payload in seat-releases: ${message}`);
              }
          } catch (e) {
              logger.error("Error processing seat-releases message:", e);
          }
      }
  });

  return io;
}
