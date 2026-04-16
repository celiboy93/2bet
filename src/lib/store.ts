import { kv } from "@vercel/kv";

export interface DailyDigits {
  date: string; // YYYY-MM-DD
  digits: string; // e.g. "4578"
  createdAt: string;
}

export interface ResultEntry {
  date: string;
  time: "12:00" | "4:30";
  number: string; // 2-digit result number
  matched: boolean;
}

// ===== Combination Generator =====
export function generateCombinations(digits: string) {
  const d = digits.split("");
  const allDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const remainingDigits = allDigits.filter((x) => !d.includes(x));

  // Pair each of the 4 digits with remaining 6 digits
  const withOthers: string[] = [];
  for (const digit of d) {
    for (const other of remainingDigits) {
      withOthers.push(digit + other);
    }
  }

  // Pair among themselves
  const amongThemselves: string[] = [];
  for (let i = 0; i < d.length; i++) {
    for (let j = i + 1; j < d.length; j++) {
      amongThemselves.push(d[i] + d[j]);
    }
  }

  // R combinations (reverse of amongThemselves)
  const rCombinations: string[] = [];
  for (let i = 0; i < d.length; i++) {
    for (let j = 0; j < d.length; j++) {
      if (i !== j) {
        const combo = d[i] + d[j];
        if (!amongThemselves.includes(combo)) {
          rCombinations.push(combo);
        }
      }
    }
  }
  // Deduplicate R combos
  const rCombosUnique = [...new Set([...amongThemselves, ...rCombinations])];

  return { withOthers, amongThemselves, rCombinations: rCombosUnique };
}

// ===== Check if result matches =====
export function checkMatch(digits: string, resultNumber: string): boolean {
  const { withOthers, rCombinations } = generateCombinations(digits);
  const allCombos = [...withOthers, ...rCombinations];
  return allCombos.includes(resultNumber);
}

// ===== KV Operations =====
export async function setDailyDigits(
  date: string,
  digits: string
): Promise<void> {
  const data: DailyDigits = {
    date,
    digits,
    createdAt: new Date().toISOString(),
  };
  await kv.set(`digits:${date}`, JSON.stringify(data));
  // Add date to index
  await kv.zadd("digits:index", { score: new Date(date).getTime(), member: date });
}

export async function getDailyDigits(
  date: string
): Promise<DailyDigits | null> {
  const raw = await kv.get<string>(`digits:${date}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function addResult(
  date: string,
  time: "12:00" | "4:30",
  number: string,
  digits: string
): Promise<ResultEntry> {
  const matched = checkMatch(digits, number);
  const entry: ResultEntry = { date, time, number, matched };
  await kv.set(`result:${date}:${time}`, JSON.stringify(entry));
  return entry;
}

export async function getResult(
  date: string,
  time: "12:00" | "4:30"
): Promise<ResultEntry | null> {
  const raw = await kv.get<string>(`result:${date}:${time}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

// Get paginated history dates
export async function getHistoryDates(
  page: number,
  perPage: number = 30
): Promise<{ dates: string[]; total: number }> {
  const total = await kv.zcard("digits:index");
  const start = Math.max(0, total - (page * perPage));
  const end = total - ((page - 1) * perPage) - 1;
  const dates = await kv.zrange<string[]>("digits:index", start, end);
  return { dates: dates.reverse(), total };
}
