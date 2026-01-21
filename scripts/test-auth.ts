import "dotenv/config";
import { hashPassword, signForUser, verifyToken } from "../src/lib/auth";
import dbConnect from "../src/lib/db";
import User from "../src/models/User";

async function testAuth() {
  console.log("Testing Authentication & Authorization...");
  await dbConnect();

  try {
    // 1. Test Password Hashing
    const password = "password123";
    const hash = await hashPassword(password);
    console.log("✅ Password hashing works.");

    // 2. Mock User
    const user = new User({
      _id: "507f1f77bcf86cd799439011", // Mock ID
      name: "Test User",
      email: "test@example.com",
      password: hash,
      role: "user",
    });

    // 3. Test Token Signing
    const token = signForUser(user);
    if (token) {
        console.log("✅ Token signing works.");
    } else {
        console.error("❌ Token signing failed.");
    }

    // 4. Test Token Verification
    const payload = verifyToken(token);
    if (payload && payload.userId === user._id.toString()) {
        console.log("✅ Token verification works.");
    } else {
        console.error("❌ Token verification failed.");
    }

  } catch (error) {
    console.error("❌ Auth test failed:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

testAuth();
