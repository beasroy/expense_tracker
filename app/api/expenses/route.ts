import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { normalizeCategoryName } from "@/lib/category";
import { createExpenseBodySchema } from "@/lib/validators/expense";

function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const idemKey = req.headers.get("X-Idempotency-Key");
  if (!idemKey) return badRequest("Idempotency key is required");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = createExpenseBodySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid request body", parsed.error.flatten());
  }

  const amountPaise = parsed.data.amount;
  const categoryName = parsed.data.category;
  const description = parsed.data.description;
  const date = parsed.data.date;
  
  const existingKey = await prisma.idempotencyKey.findUnique({
    where: { key: idemKey },
    include: {
      expense: { include: { category: true } },
    },
  });
  if (existingKey) {
    return NextResponse.json(existingKey.expense, { status: 200 });
  }
 
  try {
    const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const category = await tx.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      const expense = await tx.expense.create({
        data: {
          amountPaise,
          categoryId: category.id,
          description,
          date,
        },
        include: { category: true },
      });
      await tx.idempotencyKey.create({
        data: {
          key: idemKey,
          expenseId: expense.id,
        },
      });
      return expense;
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    // Race condition: two retries in-flight with same key.
    // If unique constraint hit, fetch and return existing.
    const raced = await prisma.idempotencyKey.findUnique({
      where: { key: idemKey },
      include: { expense: { include: { category: true } } },
    });
    if (raced) return NextResponse.json(raced.expense, { status: 200 });
    throw e;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const categoryRaw = url.searchParams.get("category")?.trim();
  const categoryNorm = categoryRaw ? normalizeCategoryName(categoryRaw) : "";
  const sort = url.searchParams.get("sort")?.trim();

  const where = categoryNorm
    ? { category: { name: categoryNorm } }
    : undefined;

  const dateOrder: "asc" | "desc" =
    sort === "date_asc" || sort === "asc" ? "asc" : "desc";

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: [{ date: dateOrder }],
    include: { category: true },
  });

  const totalPaise = expenses.reduce(
    (sum: number, e: { amountPaise: number }) => sum + e.amountPaise,
    0,
  );
  return NextResponse.json({
    items: expenses,
    totalPaise,
  });
}

