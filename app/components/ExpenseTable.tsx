"use client";

import { Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatINRFromPaise, type Expense } from "@/lib/expenses";

type Props = {
  expenses: Expense[];
  totalPaise: number;
  categories: string[];
  categoryFilter: string;
  onCategoryFilterChange: (next: string) => void;
  sort: "date_desc" | "date_asc";
  onSortChange: (next: "date_desc" | "date_asc") => void;
  isLoading?: boolean;
};

export function ExpenseTable({
  expenses,
  totalPaise,
  categories,
  categoryFilter,
  onCategoryFilterChange,
  sort,
  onSortChange,
  isLoading = false,
}: Props) {
  return (
    <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            Expenses
          </h2>
          <div className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Total:{" "}
            <span className="font-semibold text-zinc-950 dark:text-zinc-50">
              {formatINRFromPaise(totalPaise)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Filter and sort">
                <Filter />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>View options</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Category{" "}
                  <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
                    {categoryFilter ? categoryFilter : "All"}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  <DropdownMenuLabel>Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={categoryFilter}
                    onValueChange={onCategoryFilterChange}
                  >
                    <DropdownMenuRadioItem value="">All</DropdownMenuRadioItem>
                    {categories.map((c) => (
                      <DropdownMenuRadioItem key={c} value={c}>
                        {c}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Date{" "}
                  <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
                    {sort === "date_desc" ? "Newest" : "Oldest"}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  <DropdownMenuLabel>Sort by date</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={sort}
                    onValueChange={(v) =>
                      onSortChange(v as "date_desc" | "date_asc")
                    }
                  >
                    <DropdownMenuRadioItem value="date_desc">
                      Newest first
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="date_asc">
                      Oldest first
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-sm text-zinc-600 dark:text-zinc-400 sm:pb-1">
            {expenses.length} item{expenses.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <th className="border-b border-zinc-200 py-3 pr-4 dark:border-zinc-800">
                Date
              </th>
              <th className="border-b border-zinc-200 py-3 pr-4 dark:border-zinc-800">
                Category
              </th>
              <th className="border-b border-zinc-200 py-3 pr-4 dark:border-zinc-800">
                Description
              </th>
              <th className="border-b border-zinc-200 py-3 text-right dark:border-zinc-800">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="text-sm">
                  <td className="border-b border-zinc-100 py-3 pr-4 dark:border-zinc-900">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="border-b border-zinc-100 py-3 pr-4 dark:border-zinc-900">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="border-b border-zinc-100 py-3 pr-4 dark:border-zinc-900">
                    <Skeleton className="h-4 w-64" />
                  </td>
                  <td className="border-b border-zinc-100 py-3 text-right dark:border-zinc-900">
                    <div className="flex justify-end">
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              expenses.map((e) => (
                <tr
                  key={e.id}
                  className="text-sm text-zinc-950 dark:text-zinc-50"
                >
                  <td className="border-b border-zinc-100 py-3 pr-4 dark:border-zinc-900">
                    {e.date}
                  </td>
                  <td className="border-b border-zinc-100 py-3 pr-4 dark:border-zinc-900">
                    {e.category}
                  </td>
                  <td className="border-b border-zinc-100 py-3 pr-4 dark:border-zinc-900">
                    {e.description}
                  </td>
                  <td className="border-b border-zinc-100 py-3 text-right tabular-nums dark:border-zinc-900">
                    {formatINRFromPaise(e.amountPaise)}
                  </td>
                </tr>
              ))
            )}
            {!isLoading && expenses.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-sm text-zinc-600 dark:text-zinc-400"
                >
                  No expenses yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

