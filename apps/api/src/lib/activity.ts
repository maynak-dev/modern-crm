import { db, schema } from "../db/client.js";

export async function logActivity(opts: {
  ownerId: string;
  type: string;
  entity: string;
  entityId?: string | null;
  message: string;
}) {
  try {
    await db.insert(schema.activities).values({
      ownerId: opts.ownerId,
      type: opts.type,
      entity: opts.entity,
      entityId: opts.entityId ?? null,
      message: opts.message,
    });
  } catch (e) {
    console.error("activity log failed", e);
  }
}
