import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth.js";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string; name: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
