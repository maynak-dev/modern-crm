import { Router } from "express";
import { db, schema } from "../db/client.js";
import { and, desc, eq, ilike } from "drizzle-orm";
import { companySchema } from "@crm/shared";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { logActivity } from "../lib/activity.js";

export const companiesRouter = Router();
companiesRouter.use(requireAuth);

companiesRouter.get("/", async (req: AuthedRequest, res) => {
  const q = (req.query.q as string | undefined)?.trim();
  const where = q
    ? and(eq(schema.companies.ownerId, req.user!.id), ilike(schema.companies.name, `%${q}%`))
    : eq(schema.companies.ownerId, req.user!.id);
  const rows = await db.select().from(schema.companies).where(where).orderBy(desc(schema.companies.createdAt));
  res.json(rows);
});
companiesRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = companySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const [row] = await db.insert(schema.companies).values({ ...parsed.data, ownerId: req.user!.id }).returning();
  await logActivity({ ownerId: req.user!.id, type: "created", entity: "company", entityId: row.id, message: `Created company ${row.name}` });
  res.json(row);
});
companiesRouter.put("/:id", async (req: AuthedRequest, res) => {
  const parsed = companySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const [row] = await db.update(schema.companies).set(parsed.data)
    .where(and(eq(schema.companies.id, req.params.id), eq(schema.companies.ownerId, req.user!.id))).returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});
companiesRouter.delete("/:id", async (req: AuthedRequest, res) => {
  await db.delete(schema.companies)
    .where(and(eq(schema.companies.id, req.params.id), eq(schema.companies.ownerId, req.user!.id)));
  res.json({ ok: true });
});
