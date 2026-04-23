import { Router } from "express";
import { db, schema } from "../db/client.js";
import { desc, eq } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const activitiesRouter = Router();
activitiesRouter.use(requireAuth);

activitiesRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await db.select().from(schema.activities)
    .where(eq(schema.activities.ownerId, req.user!.id))
    .orderBy(desc(schema.activities.createdAt))
    .limit(50);
  res.json(rows);
});
