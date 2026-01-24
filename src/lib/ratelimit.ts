import logger from "./logger";
import redis from "./redis";

export class RateLimiter {
  /**
   * Check if an action is within the rate limit.
   * @param ip - The identifier for the user (IP address).
   * @param action - The name of the action being limited (e.g., 'select-seat').
   * @param limit - Maximum allowed actions within the window.
   * @param windowSeconds - The time window in seconds.
   * @returns Promise<boolean> - True if allowed, False if limit exceeded.
   */
  static async checkLimit(
    ip: string,
    action: string,
    limit: number,
    windowSeconds: number
  ): Promise<boolean> {
    try {
      const key = `ratelimit:${action}:${ip}`;
      
      // Increment the counter
      const currentCount = await redis.incr(key);
      
      // If it's the first action, set the expiry
      if (currentCount === 1) {
        await redis.expire(key, windowSeconds);
      }
      
      if (currentCount > limit) {
        logger.warn(`Rate limit exceeded for [${ip}] on action [${action}]: ${currentCount}/${limit}`);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error("RateLimiter error:", error);
      // Fail open (allow traffic) if Redis fails, to avoid blocking legitimate users during outages
      return true;
    }
  }
}
