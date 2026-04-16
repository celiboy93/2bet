import { NextRequest, NextResponse } from "next/server";
import {
  setDailyDigits,
  getDailyDigits,
  getResult,
  generateCombinations,
} from "@/lib/store";

// Helper: get today's date in Myanmar timezone (UTC+6:30)
function getMyanmarDate(): string {
  const now = new Date();
  const myanmarOffset = 6.5 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const myanmarTime = new Date(utc + myanmarOffset * 60000);
  const yyyy = myanmarTime.getFullYear();
  const mm = String(myanmarTime.getMonth() + 1).padStart(2, "0");
  const dd = String(myanmarTime.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// GET: get today's digits and combos
export async function GET() {
  const date = getMyanmarDate();
  const data = await getDailyDigits(date);

  if (!data) {
    return NextResponse.json({ digits: null, date });
  }

  const combos = generateCombinations(data.digits);
  const result12 = await getResult(date, "12:00");
  const result430 = await getResult(date, "4:30");

  return NextResponse.json({
    digits: data.digits,
    date: data.date,
    withOthers: combos.withOthers,
    amongThemselves: combos.amongThemselves,
    rCombinations: combos.rCombinations,
    results: {
      "12:00": result12 ? { number: result12.number, matched: result12.matched } : null,
      "4:30": result430 ? { number: result430.number, matched: result430.matched } : null,
    },
  });
}

// POST: admin sets today's digits
export async function POST(req: NextRequest) {
  // Check auth
  const authCookie = req.cookies.get("admin_auth");
  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { digits } = await req.json();

  if (!digits || !/^\d{4}$/.test(digits)) {
    return NextResponse.json(
      { error: "ဂဏန်း ၄ လုံး ထည့်ပါ" },
      { status: 400 }
    );
  }

  // Check for duplicate digits
  const unique = new Set(digits.split(""));
  if (unique.size !== 4) {
    return NextResponse.json(
      { error: "ဂဏန်း ၄ လုံး မတူညီရပါ" },
      { status: 400 }
    );
  }

  const date = getMyanmarDate();
  await setDailyDigits(date, digits);

  return NextResponse.json({ success: true, date, digits });
}
