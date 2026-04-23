import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  console.warn("[db] DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL || "postgres://invalid");
// Cast around minor type-mismatch between @neondatabase/serverless v0.9 and drizzle's expected shape.
export const db = drizzle(sql as any, { schema });
export { schema };
