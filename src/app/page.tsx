"use client";

import { useState, useEffect, useCallback } from "react";
import MyanmarClock from "@/components/MyanmarClock";

interface DailyData {
  digits: string;
  date: string;
  withOthers: string[];
  amongThemselves: string[];
  rCombinations: string[];
  results: {
    "12:00": { number: string; matched: boolean } | null;
    "4:30": { number: string; matched: boolean } | null;
  };
}

interface HistoryItem {
  date: string;
  digits: string;
  results: {
    "12:00": { number: string; matched: boolean } | null;
    "4:30": { number: string; matched: boolean } | null;
  };
}

export default function HomePage() {
  const [data, setData] = useState<DailyData | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/digits");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (page: number) => {
    try {
      const res = await fetch(`/api/results?page=${page}`);
      if (res.ok) {
        const json = await res.json();
        setHistory(json.history);
        setTotalPages(json.totalPages);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchHistory(1);
  }, [fetchData, fetchHistory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-amber-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="pt-8 pb-4 text-center">
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 title-glow leading-relaxed px-4">
          2D နေ့တိုင်း ပေါက်ချင်ပါသလား?
        </h1>
      </div>

      {/* Myanmar Clock */}
      <MyanmarClock />

      {/* Main Digits Display */}
      <div className="flex justify-center mt-8 mb-6">
        <div className="card-glass rounded-2xl px-10 py-8 text-center">
          {data?.digits ? (
            <>
              <p className="text-amber-300 text-sm mb-2">ယနေ့ ဂဏန်း ၄ လုံး</p>
              <div className="flex gap-4 justify-center">
                {data.digits.split("").map((d, i) => (
                  <div
                    key={i}
                    className="w-16 h-20 md:w-20 md:h-24 flex items-center justify-center rounded-xl bg-gradient-to-b from-amber-500/20 to-orange-600/20 border border-amber-500/30"
                  >
                    <span
                      className="text-5xl md:text-6xl font-black text-amber-400 digit-glow"
                      style={{ fontFamily: "Orbitron, monospace" }}
                    >
                      {d}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-amber-300/60 text-xl">
              ယနေ့အတွက် ဂဏန်းများ မရှိသေးပါ
            </p>
          )}
        </div>
      </div>

      {/* Rules Toggle */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowRules(!showRules)}
          className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-full text-white font-bold transition-all transform hover:scale-105 shadow-lg shadow-amber-900/30"
        >
          {showRules ? "ပိတ်ရန်" : "ကစားနည်းဖတ်ရန်"}
        </button>
      </div>

      {showRules && (
        <div className="max-w-2xl mx-auto px-4 mb-8">
          <div className="card-glass rounded-2xl p-6 text-amber-100 leading-loose text-sm md:text-base">
            <p className="mb-3">
              အထက်ဖော်ပြပါ ဂဏန်း၄လုံးသည် ယနေ့အတွက် ၁၂ဂဏန်းနဲ့ ၄ခွဲ
              ဂဏန်းအတွက် ၁လုံးထိ (သို့မဟုတ်) အပြီး ဖြစ်ပါမည်
            </p>
            <p className="mb-3">
              အရင်းနှီးရှိပြီး အမြတ်ပုံမှန်ရလိုသူများအတွက်
              ရည်ရွယ်ထားတဲ့ကစားနည်းဖြစ်ပါသည်
            </p>
            <p className="mb-3">
              မနက်ပိုင်း၁၂ဂဏန်းမှာ ယခု၄လုံးမထိပါက ညနေပိုင်းမှာ
              မိမိအမြတ်ငွေ ကျန်စေရန်နဲ့ မနက်ပိုင်းအရူံးငွေ ပြန်ရစေရန်
              (ဆတိုး) ကစားရပါမည်
            </p>
            <p>
              မနက်ပိုင်း ၁၂ဂဏန်းမှာ ထိသွားပါက
              ညနေပိုင်းဆက်ကစားဖို့ကတော့ မိမိသဘောအတိုင်းပါပဲ
              ဆက်ကစားချင်ရင်ကစားနိူင်သလို ရပ်လိုက်တာကပိုကောင်းပါသည်
            </p>
          </div>
        </div>
      )}

      {/* Combinations Section */}
      {data?.digits && (
        <div className="max-w-4xl mx-auto px-4 mb-10">
          <div className="text-center mb-4">
            <p className="text-amber-300 text-lg font-bold">
              တွဲထိုးရမယ့် ဂဏန်းများကို အလွယ်တကူ ယူနိူင်ရန်
              ထည့်ပေးထားပါသည်
            </p>
          </div>

          {/* With other 6 digits */}
          <div className="card-glass rounded-2xl p-6 mb-4">
            <h3 className="text-amber-400 font-bold mb-3 text-center">
              ကျန် ၆ လုံးနဲ့ တွဲထိုးရန်
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {data.withOthers.map((combo, i) => (
                <div
                  key={i}
                  className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-b from-blue-500/20 to-purple-600/20 border border-blue-400/30 text-blue-300 font-bold text-lg"
                >
                  {combo}
                </div>
              ))}
            </div>
          </div>

          {/* Among themselves + R */}
          <div className="card-glass rounded-2xl p-6">
            <h3 className="text-amber-400 font-bold mb-3 text-center">
              အချင်းချင်း တွဲထိုးရန် (Rထိုးကစားရန်)
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {data.rCombinations.map((combo, i) => (
                <div
                  key={i}
                  className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-b from-emerald-500/20 to-teal-600/20 border border-emerald-400/30 text-emerald-300 font-bold text-lg"
                >
                  {combo}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results History */}
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-amber-400 text-center mb-6">
          ရလဒ် မှတ်တမ်း
        </h2>

        {history.length === 0 ? (
          <p className="text-center text-amber-300/50">
            ရလဒ်မှတ်တမ်း မရှိသေးပါ
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div key={idx} className="card-glass rounded-xl p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-amber-300 font-bold">
                    {item.date}
                    <span className="ml-3 text-amber-400 text-xl">
                      [ {item.digits} ]
                    </span>
                  </div>
                  <div className="flex gap-4">
                    {/* 12:00 */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">12:00</span>
                      {item.results["12:00"] ? (
                        <>
                          <span className="font-bold text-white text-lg">
                            {item.results["12:00"].number}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-bold ${
                              item.results["12:00"].matched
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {item.results["12:00"].matched
                              ? "ပေါက်"
                              : "မပေါက်"}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500 text-sm">--</span>
                      )}
                    </div>
                    {/* 4:30 */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">4:30</span>
                      {item.results["4:30"] ? (
                        <>
                          <span className="font-bold text-white text-lg">
                            {item.results["4:30"].number}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-bold ${
                              item.results["4:30"].matched
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {item.results["4:30"].matched
                              ? "ပေါက်"
                              : "မပေါက်"}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500 text-sm">--</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => {
                const p = Math.max(1, historyPage - 1);
                setHistoryPage(p);
                fetchHistory(p);
              }}
              disabled={historyPage <= 1}
              className="px-4 py-2 rounded-lg bg-amber-600/30 text-amber-300 disabled:opacity-30 hover:bg-amber-600/50 transition"
            >
              ← Prev
            </button>
            <span className="text-amber-300 flex items-center">
              {historyPage} / {totalPages}
            </span>
            <button
              onClick={() => {
                const p = Math.min(totalPages, historyPage + 1);
                setHistoryPage(p);
                fetchHistory(p);
              }}
              disabled={historyPage >= totalPages}
              className="px-4 py-2 rounded-lg bg-amber-600/30 text-amber-300 disabled:opacity-30 hover:bg-amber-600/50 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
