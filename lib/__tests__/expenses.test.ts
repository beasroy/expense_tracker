import {
  formatLocalDateToYyyyMmDd,
  parseAmountToPaise,
  parseYyyyMmDdToLocalDate,
} from "@/lib/expenses";

describe("parseAmountToPaise", () => {
  it("parses rupees to integer paise", () => {
    expect(parseAmountToPaise("199.50")).toBe(19950);
  });

  it("returns null for invalid or non-positive amounts", () => {
    expect(parseAmountToPaise("")).toBeNull();
    expect(parseAmountToPaise("   ")).toBeNull();
    expect(parseAmountToPaise("0")).toBeNull();
    expect(parseAmountToPaise("-10")).toBeNull();
    expect(parseAmountToPaise("not-a-number")).toBeNull();
    expect(parseAmountToPaise("12.34.56")).toBeNull();
  });
});

describe("local YYYY-MM-DD helpers", () => {
  it("round-trips a calendar date without UTC day shift", () => {
    const d = parseYyyyMmDdToLocalDate("2026-04-15");
    expect(formatLocalDateToYyyyMmDd(d)).toBe("2026-04-15");
  });
});
