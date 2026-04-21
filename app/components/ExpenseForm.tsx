"use client";

import { useMemo, useState } from "react";

import {
  makeId,
  todayYyyyMmDd,
} from "@/lib/expenses";
import { createExpenseBodySchema } from "@/lib/validators/expense";

type Props = {
  onCreate: (args: {
    idempotencyKey: string;
    body: { amount: string; category: string; description: string; date: string };
  }) => Promise<void>;
};

export function ExpenseForm({ onCreate }: Props) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayYyyyMmDd);

  const [touched, setTouched] = useState({
    amount: false,
    category: false,
    description: false,
    date: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const parsed = useMemo(
    () =>
      createExpenseBodySchema.safeParse({ amount, category, description, date }),
    [amount, category, description, date],
  );

  const errors = parsed.success ? {} : parsed.error.flatten().fieldErrors;
  const show = {
    amount: submitted || touched.amount,
    category: submitted || touched.category,
    description: submitted || touched.description,
    date: submitted || touched.date,
  };
  const canSubmit = parsed.success;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingIdempotency, setPendingIdempotency] = useState<{
    key: string;
    bodyJson: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    if (!parsed.success) return;

    setSubmitError(null);

    const body = {
      amount,
      category: parsed.data.category,
      description: parsed.data.description,
      date,
    };
    const bodyJson = JSON.stringify(body);

    const idemKey =
      pendingIdempotency?.bodyJson === bodyJson
        ? pendingIdempotency.key
        : makeId();

    setPendingIdempotency({ key: idemKey, bodyJson });
    setIsSubmitting(true);

    try {
      await onCreate({ idempotencyKey: idemKey, body });

      setAmount("");
      setCategory("");
      setDescription("");
      setDate(todayYyyyMmDd());
      setTouched({
        amount: false,
        category: false,
        description: false,
        date: false,
      });
      setSubmitted(false);
      setPendingIdempotency(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create expense. Try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }

  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
        Add expense
      </h2>
      {submitError ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {submitError}
        </div>
      ) : null}
      <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <label className="grid gap-1">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Amount (₹)
          </span>
          <input
            inputMode="decimal"
            placeholder="e.g. 199.50"
            className={[
              "h-10 rounded-lg border bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:bg-zinc-950 dark:text-zinc-50",
              show.amount && errors.amount?.length
                ? "border-red-300 dark:border-red-800"
                : "border-zinc-200 dark:border-zinc-800",
            ].join(" ")}
            value={amount}
            onChange={(ev) => setAmount(ev.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
            aria-invalid={Boolean(show.amount && errors.amount?.length)}
          />
          {show.amount && errors.amount?.[0] ? (
            <span className="text-xs text-red-600 dark:text-red-400">
              {errors.amount[0]}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Category
          </span>
          <input
            placeholder="e.g. Food"
            className={[
              "h-10 rounded-lg border bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:bg-zinc-950 dark:text-zinc-50",
              show.category && errors.category?.length
                ? "border-red-300 dark:border-red-800"
                : "border-zinc-200 dark:border-zinc-800",
            ].join(" ")}
            value={category}
            onChange={(ev) => setCategory(ev.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, category: true }))}
            aria-invalid={Boolean(show.category && errors.category?.length)}
          />
          {show.category && errors.category?.[0] ? (
            <span className="text-xs text-red-600 dark:text-red-400">
              {errors.category[0]}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1 sm:col-span-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Description
          </span>
          <input
            placeholder="e.g. Lunch with friends"
            className={[
              "h-10 rounded-lg border bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:bg-zinc-950 dark:text-zinc-50",
              show.description && errors.description?.length
                ? "border-red-300 dark:border-red-800"
                : "border-zinc-200 dark:border-zinc-800",
            ].join(" ")}
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, description: true }))}
            aria-invalid={Boolean(show.description && errors.description?.length)}
          />
          {show.description && errors.description?.[0] ? (
            <span className="text-xs text-red-600 dark:text-red-400">
              {errors.description[0]}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Date
          </span>
          <input
            type="date"
            className={[
              "h-10 rounded-lg border bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:bg-zinc-950 dark:text-zinc-50",
              show.date && errors.date?.length
                ? "border-red-300 dark:border-red-800"
                : "border-zinc-200 dark:border-zinc-800",
            ].join(" ")}
            value={date}
            onChange={(ev) => setDate(ev.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, date: true }))}
            aria-invalid={Boolean(show.date && errors.date?.length)}
          />
          {show.date && errors.date?.[0] ? (
            <span className="text-xs text-red-600 dark:text-red-400">
              {errors.date[0]}
            </span>
          ) : null}
        </label>

        <div className="flex items-end justify-end gap-3">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-950"
          >
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
    </section>
  );
}

