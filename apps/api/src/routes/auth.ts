import { Router } from "express";
import { db, schema } from "../db/client.js";
import { eq } from "drizzle-orm";
import { hashPassword, signToken, verifyPassword } from "../lib/auth.js";
import { loginSchema, registerSchema } from "@crm/shared";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, name } = parsed.data;

  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (existing.length) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(schema.users)
    .values({ email, passwordHash, name })
    .returning();

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

authRouter.get("/me", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { verifyToken } = await import("../lib/auth.js");
    const u = verifyToken(header.slice(7));
    res.json({ user: u });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});
