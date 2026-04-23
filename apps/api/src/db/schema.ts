import { pgTable, uuid, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    domain: text("domain").default(""),
    industry: text("industry").default(""),
    size: text("size").default(""),
    website: text("website").default(""),
    notes: text("notes").default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ byOwner: index("companies_owner_idx").on(t.ownerId) })
);

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").default(""),
    email: text("email").default(""),
    phone: text("phone").default(""),
    title: text("title").default(""),
    companyId: uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    notes: text("notes").default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ byOwner: index("contacts_owner_idx").on(t.ownerId) })
);

export const deals = pgTable(
  "deals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    value: integer("value").default(0).notNull(),
    currency: text("currency").default("USD").notNull(),
    stage: text("stage").default("lead").notNull(),
    contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
    companyId: uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
    expectedCloseDate: timestamp("expected_close_date", { withTimezone: true }),
    notes: text("notes").default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ byOwner: index("deals_owner_idx").on(t.ownerId) })
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").default(""),
    dueDate: timestamp("due_date", { withTimezone: true }),
    status: text("status").default("todo").notNull(),
    priority: text("priority").default("medium").notNull(),
    contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
    dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ byOwner: index("tasks_owner_idx").on(t.ownerId) })
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // created_contact, updated_deal, ...
    entity: text("entity").notNull(), // contact, deal, company, task
    entityId: uuid("entity_id"),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ byOwner: index("activities_owner_idx").on(t.ownerId) })
);
