import "dotenv/config";
import dbConnect from "../src/lib/db";
import redis from "../src/lib/redis";
import Movie from "../src/models/Movie";

async function testDatabase() {
  console.log("Testing MongoDB connection...");
  try {
    await dbConnect();
    console.log("✅ MongoDB connected successfully.");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }

  console.log("Testing Redis connection...");
  try {
    await redis.set("test-key", "Hello Redis");
    const value = await redis.get("test-key");
    if (value === "Hello Redis") {
      console.log("✅ Redis connected and working.");
    } else {
      console.error("❌ Redis value mismatch.");
    }
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
  }

  console.log("Testing Mongoose Schema...");
  try {
    const movie = new Movie({
        title: "Test Movie",
        description: "Test Description",
        posterUrl: "http://example.com/poster.jpg",
        trailerUrl: "http://example.com/trailer",
        runtime: 120,
        rating: "PG-13",
        genres: ["Action"],
    });
    // validating without saving to avoid DB writes if not needed, 
    // or we can save and delete. Let's just validate sync.
    await movie.validate();
    console.log("✅ Movie Schema validation passed.");
  } catch (error) {
    console.error("❌ Movie Schema validation failed:", error);
  }

  process.exit(0);
}

testDatabase();
