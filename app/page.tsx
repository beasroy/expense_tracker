"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { ExpenseForm } from "@/app/components/ExpenseForm";
import { ExpenseTable } from "@/app/components/ExpenseTable";
import { normalizeApiExpense, type ApiExpense, type Expense } from "@/lib/expenses";

export default function Home() {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState<"date_desc" | "date_asc">("date_desc");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalPaise, setTotalPaise] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const e of expenses) set.add(e.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [expenses]);

  const fetchExpenses = useCallback(async (next?: {
    category?: string;
    sort?: "date_desc" | "date_asc";
  }) => {
    const category = next?.category ?? categoryFilter;
    const sortParam = next?.sort ?? sort;

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    params.set("sort", sortParam);

    setIsLoading(true);
    setLoadError(null);
    try {
      const { data } = await axios.get<{
        items: ApiExpense[];
        totalPaise: number;
      }>("/api/expenses", {
        params: Object.fromEntries(params.entries()),
        headers: {
          "Cache-Control": "no-store",
        },
      });

      setExpenses(data.items.map(normalizeApiExpense));
      setTotalPaise(data.totalPaise);
    } catch (e: unknown) {
      const message = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string } | undefined)?.error ||
          e.message
        : e instanceof Error
          ? e.message
          : "Failed to load expenses";
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, sort]);

  useEffect(() => {
    // Data fetch on filter/sort changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchExpenses();
  }, [fetchExpenses]);

  async function onCreate(args: {
    idempotencyKey: string;
    body: { amount: string; category: string; description: string; date: string };
  }) {
    try {
      await axios.post("/api/expenses", args.body, {
        headers: {
          "X-Idempotency-Key": args.idempotencyKey,
        },
      });
    } catch (e: unknown) {
      const message = axios.isAxiosError(e)
        ? (e.response?.data as { error?: string } | undefined)?.error ||
          e.message
        : e instanceof Error
          ? e.message
          : "Failed to create expense";
      throw new Error(message);
    }

    await fetchExpenses();
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10 font-sans dark:bg-black">
      <main className="w-full max-w-4xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Expense Tracker
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Add expenses and review them .
          </p>
        </header>

        <ExpenseForm onCreate={onCreate} />

        {loadError ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {loadError}
          </div>
        ) : null}
        <ExpenseTable
          expenses={expenses}
          totalPaise={totalPaise}
          categories={categories}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          sort={sort}
          onSortChange={setSort}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
