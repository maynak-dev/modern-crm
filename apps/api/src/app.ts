import express from "express";
import cors from "cors";
import "dotenv/config";
import { authRouter } from "./routes/auth.js";
import { contactsRouter } from "./routes/contacts.js";
import { companiesRouter } from "./routes/companies.js";
import { dealsRouter } from "./routes/deals.js";
import { tasksRouter } from "./routes/tasks.js";
import { activitiesRouter } from "./routes/activities.js";
import { dashboardRouter } from "./routes/dashboard.js";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(
    cors({
      origin: (origin, cb) => {
        const allowed = (process.env.CORS_ORIGIN || "*").split(",").map((s) => s.trim());
        if (!origin || allowed.includes("*") || allowed.includes(origin)) return cb(null, true);
        cb(null, false);
      },
      credentials: false,
    })
  );

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/auth", authRouter);
  app.use("/contacts", contactsRouter);
  app.use("/companies", companiesRouter);
  app.use("/deals", dealsRouter);
  app.use("/tasks", tasksRouter);
  app.use("/activities", activitiesRouter);
  app.use("/dashboard", dashboardRouter);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
