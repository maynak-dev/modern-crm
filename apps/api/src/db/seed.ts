import "dotenv/config";
import { db, schema } from "./client.js";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/auth.js";

async function main() {
  const email = "demo@crm.app";
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
  let user = existing[0];
  if (!user) {
    const passwordHash = await hashPassword("demo1234");
    [user] = await db.insert(schema.users).values({ email, passwordHash, name: "Demo User" }).returning();
    console.log("Created demo user:", email, "/ demo1234");
  } else {
    console.log("Demo user already exists:", email);
  }

  const [acme] = await db.insert(schema.companies).values({
    ownerId: user.id, name: "Acme Inc.", domain: "acme.com", industry: "SaaS", size: "50-200", website: "https://acme.com",
  }).returning();
  const [globex] = await db.insert(schema.companies).values({
    ownerId: user.id, name: "Globex Corp.", domain: "globex.com", industry: "Manufacturing", size: "1000+", website: "https://globex.com",
  }).returning();

  const [c1] = await db.insert(schema.contacts).values({
    ownerId: user.id, firstName: "Alice", lastName: "Johnson", email: "alice@acme.com", phone: "+1 555-0100", title: "VP Sales", companyId: acme.id, tags: ["vip", "decision-maker"],
  }).returning();
  await db.insert(schema.contacts).values({
    ownerId: user.id, firstName: "Bob", lastName: "Smith", email: "bob@globex.com", phone: "+1 555-0101", title: "CTO", companyId: globex.id, tags: ["technical"],
  });

  await db.insert(schema.deals).values([
    { ownerId: user.id, title: "Acme — Annual Plan", value: 24000, stage: "proposal", contactId: c1.id, companyId: acme.id, currency: "USD" },
    { ownerId: user.id, title: "Globex — Pilot", value: 8000, stage: "qualified", companyId: globex.id, currency: "USD" },
    { ownerId: user.id, title: "Inbound lead — Beta Co.", value: 3500, stage: "lead", currency: "USD" },
  ]);

  await db.insert(schema.tasks).values([
    { ownerId: user.id, title: "Send proposal to Alice", priority: "high", status: "todo", contactId: c1.id },
    { ownerId: user.id, title: "Follow up with Bob next week", priority: "medium", status: "todo" },
  ]);

  console.log("Seed complete.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
