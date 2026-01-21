import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable inside .env");
}

export interface TokenPayload {
  userId: string;
  role: string;
}

export function signForUser(user: IUser): string {
  const payload: TokenPayload = {
    userId: String(user._id),
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// ... existing codes
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getUserFromRequest(req: Request): TokenPayload | null {
  const token = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("auth-token="))?.split("=")[1];
  if (!token) return null;
  return verifyToken(token);
}
