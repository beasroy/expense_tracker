import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function parseAmountPaise(amount: unknown): number | null {
 if (typeof amount === "number" && Number.isFinite(amount)) {
    return Math.round(amount * 100);
  }
  if (typeof amount === "string") {
    const trimmed = amount.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 100);
  }
  return null;
}

export async function POST(req: NextRequest) {
  const idemKey = req.headers.get("X-Idempotency-Key");
  if (!idemKey) return badRequest("Idempotency key is required");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const amountPaise = parseAmountPaise(body.amount);
  const categoryName = typeof body.category === "string" ? body.category.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const dateStr = typeof body.date === "string" ? body.date : null;


  if (amountPaise == null || amountPaise <= 0)
    return badRequest("amount must be a positive number");
  if (!categoryName) return badRequest("category is required");
  if (!description) return badRequest("description is required");
  if (!dateStr) return badRequest("date is required (ISO string)");
  
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return badRequest("date must be valid ISO");
  
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
  const category = url.searchParams.get("category")?.trim();
  const sort = url.searchParams.get("sort")?.trim();

  const where = category ? { category: { name: category } } : undefined;

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

