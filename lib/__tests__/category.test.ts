import { normalizeCategoryName } from "@/lib/category";

describe("normalizeCategoryName", () => {
  it("trims and lowercases", () => {
    expect(normalizeCategoryName("  Food  ")).toBe("food");
  });

  it("collapses case variants to the same key", () => {
    expect(normalizeCategoryName("FOOD")).toBe(normalizeCategoryName("food"));
  });

  it("returns empty string for whitespace-only input (callers should reject)", () => {
    expect(normalizeCategoryName("   \t  ")).toBe("");
  });
});
