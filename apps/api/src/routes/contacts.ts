import { Router } from "express";
import { db, schema } from "../db/client.js";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { contactSchema } from "@crm/shared";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { logActivity } from "../lib/activity.js";

export const contactsRouter = Router();
contactsRouter.use(requireAuth);

contactsRouter.get("/", async (req: AuthedRequest, res) => {
  const q = (req.query.q as string | undefined)?.trim();
  const where = q
    ? and(
        eq(schema.contacts.ownerId, req.user!.id),
        or(
          ilike(schema.contacts.firstName, `%${q}%`),
          ilike(schema.contacts.lastName, `%${q}%`),
          ilike(schema.contacts.email, `%${q}%`),
          ilike(schema.contacts.title, `%${q}%`)
        )
      )
    : eq(schema.contacts.ownerId, req.user!.id);
  const rows = await db.select().from(schema.contacts).where(where).orderBy(desc(schema.contacts.createdAt));
  res.json(rows);
});

contactsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const [row] = await db
    .insert(schema.contacts)
    .values({ ...parsed.data, ownerId: req.user!.id, companyId: parsed.data.companyId ?? null })
    .returning();
  await logActivity({
    ownerId: req.user!.id,
    type: "created",
    entity: "contact",
    entityId: row.id,
    message: `Created contact ${row.firstName} ${row.lastName ?? ""}`.trim(),
  });
  res.json(row);
});

contactsRouter.get("/:id", async (req: AuthedRequest, res) => {
  const [row] = await db
    .select()
    .from(schema.contacts)
    .where(and(eq(schema.contacts.id, req.params.id), eq(schema.contacts.ownerId, req.user!.id)));
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

contactsRouter.put("/:id", async (req: AuthedRequest, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const [row] = await db
    .update(schema.contacts)
    .set({ ...parsed.data, companyId: parsed.data.companyId ?? null })
    .where(and(eq(schema.contacts.id, req.params.id), eq(schema.contacts.ownerId, req.user!.id)))
    .returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  await logActivity({
    ownerId: req.user!.id, type: "updated", entity: "contact", entityId: row.id,
    message: `Updated contact ${row.firstName} ${row.lastName ?? ""}`.trim(),
  });
  res.json(row);
});

contactsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  await db
    .delete(schema.contacts)
    .where(and(eq(schema.contacts.id, req.params.id), eq(schema.contacts.ownerId, req.user!.id)));
  await logActivity({
    ownerId: req.user!.id, type: "deleted", entity: "contact", entityId: req.params.id,
    message: `Deleted contact`,
  });
  res.json({ ok: true });
});
