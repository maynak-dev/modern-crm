import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";

export function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}
export function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}
export function signToken(payload: { id: string; email: string; name: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}
export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { id: string; email: string; name: string };
}
