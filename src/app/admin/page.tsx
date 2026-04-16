"use client";

import { useState, useEffect, useCallback } from "react";

interface ResultData {
  date: string;
  time: "12:00" | "4:30";
  number: string;
  matched: boolean;
}

interface HistoryItem {
  date: string;
  digits: string;
  results: {
    "12:00": { number: string; matched: boolean } | null;
    "4:30": { number: string; matched: boolean } | null;
  };
}

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [digits, setDigits] = useState("");
  const [digitMsg, setDigitMsg] = useState("");
  const [digitMsgType, setDigitMsgType] = useState<"success" | "error">("success");

  const [resultDate, setResultDate] = useState("");
  const [resultTime, setResultTime] = useState<"12:00" | "4:30">("12:00");
  const [resultNumber, setResultNumber] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const [resultMsgType, setResultMsgType] = useState<"success" | "error">("success");
  const [lastResult, setLastResult] = useState<ResultData | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Get Myanmar date for default
  function getMyanmarDateStr() {
    const now = new Date();
    const myanmarOffset = 6.5 * 60;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const myanmarTime = new Date(utc + myanmarOffset * 60000);
    const yyyy = myanmarTime.getFullYear();
    const mm = String(myanmarTime.getMonth() + 1).padStart(2, "0");
    const dd = String(myanmarTime.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  useEffect(() => {
    setResultDate(getMyanmarDateStr());
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

  const handleLogin = async () => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setIsAuth(true);
      setAuthError("");
      fetchHistory(1);
    } else {
      setAuthError("Password မှားနေပါသည်");
    }
  };

  const handleSetDigits = async () => {
    const res = await fetch("/api/digits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ digits }),
    });
    const json = await res.json();
    if (res.ok) {
      setDigitMsg(`ဂဏန်း ${digits} သိမ်းပြီးပါပြီ (${json.date})`);
      setDigitMsgType("success");
      setDigits("");
      fetchHistory(historyPage);
    } else {
      setDigitMsg(json.error || "Error");
      setDigitMsgType("error");
    }
  };

  const handleAddResult = async () => {
    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: resultDate,
        time: resultTime,
        number: resultNumber,
      }),
    });
    const json = await res.json();
    if (res.ok) {
      setLastResult(json.entry);
      setResultMsg(
        `ရလဒ် ${resultNumber} - ${json.entry.matched ? "✅ ပေါက်သည်" : "❌ မပေါက်ပါ"}`
      );
      setResultMsgType(json.entry.matched ? "success" : "error");
      setResultNumber("");
      fetchHistory(historyPage);
    } else {
      setResultMsg(json.error || "Error");
      setResultMsgType("error");
      setLastResult(null);
    }
  };

  // Login Screen
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-glass rounded-2xl p-8 max-w-sm w-full">
          <h2 className="text-2xl font-bold text-amber-400 text-center mb-6">
            Admin Login
          </h2>
          <input
            type="password"
            placeholder="Password ထည့်ပါ"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-amber-500/30 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 mb-4"
          />
          {authError && (
            <p className="text-red-400 text-sm mb-3">{authError}</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl text-white font-bold hover:from-amber-500 hover:to-orange-500 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen pb-20">
      <div className="pt-8 text-center">
        <h1 className="text-3xl font-bold text-amber-400">Admin Dashboard</h1>
        <p className="text-amber-300/60 mt-1 text-sm">
          {getMyanmarDateStr()} (Myanmar Time)
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-6">
        {/* Set Daily Digits */}
        <div className="card-glass rounded-2xl p-6">
          <h3 className="text-xl font-bold text-amber-400 mb-4">
            ယနေ့ ဂဏန်း ၄ လုံး တင်ရန်
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              maxLength={4}
              placeholder="ဥပမာ: 4578"
              value={digits}
              onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-amber-500/30 text-white text-2xl text-center tracking-[0.5em] placeholder-gray-500 focus:outline-none focus:border-amber-400"
              style={{ fontFamily: "Orbitron, monospace" }}
            />
            <button
              onClick={handleSetDigits}
              disabled={digits.length !== 4}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-bold disabled:opacity-30 hover:from-green-500 hover:to-emerald-500 transition"
            >
              သိမ်းမယ်
            </button>
          </div>
          {digitMsg && (
            <p
              className={`mt-3 text-sm ${digitMsgType === "success" ? "text-green-400" : "text-red-400"}`}
            >
              {digitMsg}
            </p>
          )}
        </div>

        {/* Add Result */}
        <div className="card-glass rounded-2xl p-6">
          <h3 className="text-xl font-bold text-amber-400 mb-4">
            ရလဒ် ထည့်ရန်
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input
              type="date"
              value={resultDate}
              onChange={(e) => setResultDate(e.target.value)}
              className="px-3 py-3 rounded-xl bg-white/10 border border-amber-500/30 text-white focus:outline-none focus:border-amber-400"
            />
            <select
              value={resultTime}
              onChange={(e) =>
                setResultTime(e.target.value as "12:00" | "4:30")
              }
              className="px-3 py-3 rounded-xl bg-white/10 border border-amber-500/30 text-white focus:outline-none focus:border-amber-400"
            >
              <option value="12:00" className="bg-gray-900">
                12:00
              </option>
              <option value="4:30" className="bg-gray-900">
                4:30
              </option>
            </select>
            <input
              type="text"
              maxLength={2}
              placeholder="ရလဒ်"
              value={resultNumber}
              onChange={(e) =>
                setResultNumber(e.target.value.replace(/\D/g, ""))
              }
              className="px-3 py-3 rounded-xl bg-white/10 border border-amber-500/30 text-white text-2xl text-center tracking-widest placeholder-gray-500 focus:outline-none focus:border-amber-400"
              style={{ fontFamily: "Orbitron, monospace" }}
            />
          </div>
          <button
            onClick={handleAddResult}
            disabled={resultNumber.length !== 2}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold disabled:opacity-30 hover:from-blue-500 hover:to-purple-500 transition"
          >
            စစ်ဆေးပြီး သိမ်းမယ်
          </button>
          {resultMsg && (
            <p
              className={`mt-3 text-center font-bold text-lg ${resultMsgType === "success" ? "text-green-400" : "text-red-400"}`}
            >
              {resultMsg}
            </p>
          )}
        </div>

        {/* History */}
        <div className="card-glass rounded-2xl p-6">
          <h3 className="text-xl font-bold text-amber-400 mb-4">
            ရလဒ် မှတ်တမ်း
          </h3>
          {history.length === 0 ? (
            <p className="text-gray-400">မှတ်တမ်းမရှိပါ</p>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-amber-300 font-bold">
                      {item.date}
                    </span>
                    <span className="text-amber-400 font-mono text-xl">
                      {item.digits}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">12:00</div>
                      {item.results["12:00"] ? (
                        <div>
                          <span className="text-white font-bold text-lg">
                            {item.results["12:00"].number}
                          </span>
                          <span
                            className={`ml-2 text-xs ${item.results["12:00"].matched ? "text-green-400" : "text-red-400"}`}
                          >
                            {item.results["12:00"].matched
                              ? "ပေါက်"
                              : "မပေါက်"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">--</span>
                      )}
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">4:30</div>
                      {item.results["4:30"] ? (
                        <div>
                          <span className="text-white font-bold text-lg">
                            {item.results["4:30"].number}
                          </span>
                          <span
                            className={`ml-2 text-xs ${item.results["4:30"].matched ? "text-green-400" : "text-red-400"}`}
                          >
                            {item.results["4:30"].matched
                              ? "ပေါက်"
                              : "မပေါက်"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">--</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => {
                  const p = Math.max(1, historyPage - 1);
                  setHistoryPage(p);
                  fetchHistory(p);
                }}
                disabled={historyPage <= 1}
                className="px-4 py-2 rounded-lg bg-amber-600/30 text-amber-300 disabled:opacity-30"
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
                className="px-4 py-2 rounded-lg bg-amber-600/30 text-amber-300 disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
