import { Router } from "express";
import { db, schema } from "../db/client.js";
import { and, desc, eq } from "drizzle-orm";
import { dealSchema } from "@crm/shared";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { logActivity } from "../lib/activity.js";

export const dealsRouter = Router();
dealsRouter.use(requireAuth);

function toDate(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

dealsRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await db.select().from(schema.deals)
    .where(eq(schema.deals.ownerId, req.user!.id))
    .orderBy(desc(schema.deals.createdAt));
  res.json(rows);
});

dealsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = dealSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const [row] = await db.insert(schema.deals).values({
    ...parsed.data,
    contactId: parsed.data.contactId ?? null,
    companyId: parsed.data.companyId ?? null,
    expectedCloseDate: toDate(parsed.data.expectedCloseDate),
    ownerId: req.user!.id,
  }).returning();
  await logActivity({ ownerId: req.user!.id, type: "created", entity: "deal", entityId: row.id, message: `Created deal "${row.title}"` });
  res.json(row);
});

dealsRouter.put("/:id", async (req: AuthedRequest, res) => {
  const parsed = dealSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data: any = { ...parsed.data };
  if ("expectedCloseDate" in data) data.expectedCloseDate = toDate(data.expectedCloseDate);
  if ("contactId" in data) data.contactId = data.contactId ?? null;
  if ("companyId" in data) data.companyId = data.companyId ?? null;
  const [row] = await db.update(schema.deals).set(data)
    .where(and(eq(schema.deals.id, req.params.id), eq(schema.deals.ownerId, req.user!.id))).returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  await logActivity({ ownerId: req.user!.id, type: "updated", entity: "deal", entityId: row.id, message: `Updated deal "${row.title}"` });
  res.json(row);
});

dealsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  await db.delete(schema.deals)
    .where(and(eq(schema.deals.id, req.params.id), eq(schema.deals.ownerId, req.user!.id)));
  res.json({ ok: true });
});
