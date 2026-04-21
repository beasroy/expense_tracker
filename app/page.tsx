"use client";

import { useMemo, useState } from "react";

import { ExpenseForm } from "@/app/components/ExpenseForm";
import { ExpenseTable } from "@/app/components/ExpenseTable";
import { makeId, todayYyyyMmDd, type Expense } from "@/lib/expenses";

export default function Home() {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState<"date_desc" | "date_asc">("date_desc");

  const [expenses, setExpenses] = useState<Expense[]>(() => [
    {
      id: makeId(),
      amountPaise: 24900,
      category: "Food",
      description: "Groceries",
      date: todayYyyyMmDd(),
      createdAt: new Date().toISOString(),
    },
  ]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const e of expenses) set.add(e.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [expenses]);

  const visibleExpenses = useMemo(() => {
    const filtered = categoryFilter
      ? expenses.filter((e) => e.category === categoryFilter)
      : expenses.slice();

    filtered.sort((a, b) =>
      sort === "date_asc"
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date),
    );

    return filtered;
  }, [categoryFilter, expenses, sort]);

  const totalVisiblePaise = useMemo(
    () =>
      visibleExpenses.reduce(
        (sum: number, e: Expense) => sum + e.amountPaise,
        0,
      ),
    [visibleExpenses],
  );

  function onAdd(expense: Omit<Expense, "id" | "createdAt">) {
    const next: Expense = {
      id: makeId(),
      ...expense,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [next, ...prev]);
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10 font-sans dark:bg-black">
      <main className="w-full max-w-4xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Expense Tracker
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Add expenses and review them locally (API integration next).
          </p>
        </header>

        <ExpenseForm onAdd={onAdd} />
        <ExpenseTable
          expenses={visibleExpenses}
          totalPaise={totalVisiblePaise}
          categories={categories}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          sort={sort}
          onSortChange={setSort}
        />
      </main>
    </div>
  );
}
