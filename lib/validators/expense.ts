import { z } from "zod";

import { normalizeCategoryName } from "@/lib/category";

function parseAmountToPaise(amount: unknown): number {
  if (typeof amount === "number" && Number.isFinite(amount)) {
    return Math.round(amount * 100);
  }
  if (typeof amount === "string") {
    const trimmed = amount.trim();
    if (!trimmed) return Number.NaN;
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return Number.NaN;
    return Math.round(n * 100);
  }
  return Number.NaN;
}

export const createExpenseBodySchema = z.object({
  amount: z
    .unknown()
    .transform((v) => parseAmountToPaise(v))
    .refine((paise) => Number.isFinite(paise) && paise > 0, {
      message: "amount must be a positive number",
    }),
  category: z
    .string()
    .trim()
    .min(1, "category is required")
    .max(50, "category is too long")
    .transform((s) => normalizeCategoryName(s)),
  description: z
    .string()
    .trim()
    .min(1, "description is required")
    .max(280, "description is too long"),
  date: z
    .string()
    .trim()
    .min(1, "date is required")
    .transform((s) => new Date(s))
    .refine((d) => !Number.isNaN(d.getTime()), {
      message: "date must be a valid ISO date string",
    }),
});

export type CreateExpenseBody = z.infer<typeof createExpenseBodySchema>;

