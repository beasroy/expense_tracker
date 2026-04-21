export type Expense = {
  id: string;
  amountPaise: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO
};

export type ApiExpense = {
  id: string;
  amountPaise: number;
  description: string;
  date: string; // ISO string
  createdAt: string; // ISO string
  category: { id: string; name: string; createdAt: string };
};

function isoToYyyyMmDd(isoOrDate: string) {
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return isoOrDate;
  return d.toISOString().slice(0, 10);
}

export function normalizeApiExpense(api: ApiExpense): Expense {
  return {
    id: api.id,
    amountPaise: api.amountPaise,
    category: api.category.name,
    description: api.description,
    date: isoToYyyyMmDd(api.date),
    createdAt: api.createdAt,
  };
}

export function formatINRFromPaise(paise: number) {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function parseAmountToPaise(amount: string): number | null {
  const trimmed = amount.trim();
  if (!trimmed) return null;

  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;

  return Math.round(n * 100);
}

export function todayYyyyMmDd() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? String(Date.now());
}

