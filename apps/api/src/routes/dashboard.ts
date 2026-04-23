import { Router } from "express";
import { db, schema } from "../db/client.js";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (req: AuthedRequest, res) => {
  const ownerId = req.user!.id;
  const [contacts, companies, deals, tasks] = await Promise.all([
    db.select().from(schema.contacts).where(eq(schema.contacts.ownerId, ownerId)),
    db.select().from(schema.companies).where(eq(schema.companies.ownerId, ownerId)),
    db.select().from(schema.deals).where(eq(schema.deals.ownerId, ownerId)),
    db.select().from(schema.tasks).where(eq(schema.tasks.ownerId, ownerId)),
  ]);

  const pipelineValue = deals
    .filter((d) => d.stage !== "lost")
    .reduce((s, d) => s + (d.value || 0), 0);
  const wonValue = deals.filter((d) => d.stage === "won").reduce((s, d) => s + (d.value || 0), 0);
  const openTasks = tasks.filter((t) => t.status !== "done").length;

  const byStage: Record<string, { count: number; value: number }> = {};
  for (const d of deals) {
    byStage[d.stage] ??= { count: 0, value: 0 };
    byStage[d.stage].count++;
    byStage[d.stage].value += d.value || 0;
  }

  res.json({
    counts: {
      contacts: contacts.length,
      companies: companies.length,
      deals: deals.length,
      openTasks,
    },
    pipelineValue,
    wonValue,
    byStage,
  });
});
