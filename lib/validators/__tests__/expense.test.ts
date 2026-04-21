import { createExpenseBodySchema } from "@/lib/validators/expense";

describe("createExpenseBodySchema", () => {
  it("accepts a valid payload and normalizes category", () => {
    const result = createExpenseBodySchema.safeParse({
      amount: "10.5",
      category: "  Groceries ",
      description: "Milk",
      date: "2026-04-15T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.amount).toBe(1050);
    expect(result.data.category).toBe("groceries");
    expect(result.data.description).toBe("Milk");
    expect(result.data.date).toBeInstanceOf(Date);
  });

  it("rejects a negative amount", () => {
    const result = createExpenseBodySchema.safeParse({
      amount: "-1",
      category: "food",
      description: "x",
      date: "2026-04-15",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero and non-numeric amounts", () => {
    expect(
      createExpenseBodySchema.safeParse(baseValid({ amount: "0" })).success,
    ).toBe(false);
    expect(
      createExpenseBodySchema.safeParse(baseValid({ amount: "abc" })).success,
    ).toBe(false);
  });

  it("rejects empty or whitespace-only category", () => {
    expect(
      createExpenseBodySchema.safeParse(baseValid({ category: "" })).success,
    ).toBe(false);
    expect(
      createExpenseBodySchema.safeParse(baseValid({ category: "   " })).success,
    ).toBe(false);
  });

  it("rejects empty description", () => {
    expect(
      createExpenseBodySchema.safeParse(baseValid({ description: "" })).success,
    ).toBe(false);
  });

  it("rejects invalid date strings", () => {
    expect(
      createExpenseBodySchema.safeParse(
        baseValid({ date: "not-a-real-date" }),
      ).success,
    ).toBe(false);
    expect(
      createExpenseBodySchema.safeParse(baseValid({ date: "" })).success,
    ).toBe(false);
  });
});

function baseValid(
  overrides: Partial<{
    amount: string;
    category: string;
    description: string;
    date: string;
  }>,
) {
  return {
    amount: "10",
    category: "food",
    description: "Snack",
    date: "2026-04-15",
    ...overrides,
  };
}
