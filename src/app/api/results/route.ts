import { NextRequest, NextResponse } from "next/server";
import {
  addResult,
  getDailyDigits,
  getResult,
  getHistoryDates,
  generateCombinations,
} from "@/lib/store";

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

// GET: paginated history
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 30;

  const { dates, total } = await getHistoryDates(page, perPage);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const history = await Promise.all(
    dates.map(async (date) => {
      const digits = await getDailyDigits(date);
      const result12 = await getResult(date, "12:00");
      const result430 = await getResult(date, "4:30");
      return {
        date,
        digits: digits?.digits || "",
        results: {
          "12:00": result12
            ? { number: result12.number, matched: result12.matched }
            : null,
          "4:30": result430
            ? { number: result430.number, matched: result430.matched }
            : null,
        },
      };
    })
  );

  return NextResponse.json({ history, totalPages, currentPage: page });
}

// POST: admin adds result
export async function POST(req: NextRequest) {
  const authCookie = req.cookies.get("admin_auth");
  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, time, number } = await req.json();

  if (!date || !time || !number) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (time !== "12:00" && time !== "4:30") {
    return NextResponse.json({ error: "Invalid time" }, { status: 400 });
  }

  if (!/^\d{2}$/.test(number)) {
    return NextResponse.json(
      { error: "ဂဏန်း ၂ လုံး ထည့်ပါ" },
      { status: 400 }
    );
  }

  const dailyDigits = await getDailyDigits(date);
  if (!dailyDigits) {
    return NextResponse.json(
      { error: "ထိုနေ့အတွက် ဂဏန်း ၄ လုံး မရှိပါ" },
      { status: 400 }
    );
  }

  const entry = await addResult(date, time, number, dailyDigits.digits);

  return NextResponse.json({ success: true, entry });
}
