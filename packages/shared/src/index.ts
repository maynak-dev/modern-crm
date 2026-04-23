import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(80),
});

export const contactSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  phone: z.string().max(40).optional().default(""),
  title: z.string().max(120).optional().default(""),
  companyId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().max(40)).max(20).optional().default([]),
  notes: z.string().max(4000).optional().default(""),
});

export const companySchema = z.object({
  name: z.string().min(1).max(160),
  domain: z.string().max(120).optional().default(""),
  industry: z.string().max(80).optional().default(""),
  size: z.string().max(40).optional().default(""),
  website: z.string().max(200).optional().default(""),
  notes: z.string().max(4000).optional().default(""),
});

export const dealStages = ["lead", "qualified", "proposal", "negotiation", "won", "lost"] as const;
export type DealStage = (typeof dealStages)[number];

export const dealSchema = z.object({
  title: z.string().min(1).max(160),
  value: z.number().nonnegative().default(0),
  currency: z.string().length(3).default("USD"),
  stage: z.enum(dealStages).default("lead"),
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  expectedCloseDate: z.string().nullable().optional(),
  notes: z.string().max(4000).optional().default(""),
});

export const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(""),
  dueDate: z.string().nullable().optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  contactId: z.string().uuid().nullable().optional(),
  dealId: z.string().uuid().nullable().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
