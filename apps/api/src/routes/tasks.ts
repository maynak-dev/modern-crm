import { Router } from "express";
import { db, schema } from "../db/client.js";
import { and, desc, eq } from "drizzle-orm";
import { taskSchema } from "@crm/shared";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { logActivity } from "../lib/activity.js";

export const tasksRouter = Router();
tasksRouter.use(requireAuth);

function toDate(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

tasksRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await db.select().from(schema.tasks)
    .where(eq(schema.tasks.ownerId, req.user!.id))
    .orderBy(desc(schema.tasks.createdAt));
  res.json(rows);
});

tasksRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const [row] = await db.insert(schema.tasks).values({
    ...parsed.data,
    contactId: parsed.data.contactId ?? null,
    dealId: parsed.data.dealId ?? null,
    dueDate: toDate(parsed.data.dueDate),
    ownerId: req.user!.id,
  }).returning();
  await logActivity({ ownerId: req.user!.id, type: "created", entity: "task", entityId: row.id, message: `Created task "${row.title}"` });
  res.json(row);
});

tasksRouter.put("/:id", async (req: AuthedRequest, res) => {
  const parsed = taskSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data: any = { ...parsed.data };
  if ("dueDate" in data) data.dueDate = toDate(data.dueDate);
  if ("contactId" in data) data.contactId = data.contactId ?? null;
  if ("dealId" in data) data.dealId = data.dealId ?? null;
  const [row] = await db.update(schema.tasks).set(data)
    .where(and(eq(schema.tasks.id, req.params.id), eq(schema.tasks.ownerId, req.user!.id))).returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

tasksRouter.delete("/:id", async (req: AuthedRequest, res) => {
  await db.delete(schema.tasks)
    .where(and(eq(schema.tasks.id, req.params.id), eq(schema.tasks.ownerId, req.user!.id)));
  res.json({ ok: true });
});
