"use client";

import { useState, useEffect } from "react";

export default function MyanmarClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      // Myanmar is UTC+6:30
      const myanmarOffset = 6.5 * 60;
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const myanmarTime = new Date(utc + myanmarOffset * 60000);

      const days = [
        "တနင်္ဂနွေ",
        "တနင်္လာ",
        "အင်္ဂါ",
        "ဗုဒ္ဓဟူး",
        "ကြာသပတေး",
        "သောကြာ",
        "စနေ",
      ];

      const day = days[myanmarTime.getDay()];
      const dd = myanmarTime.getDate();
      const mm = myanmarTime.getMonth() + 1;
      const yyyy = myanmarTime.getFullYear();

      setDate(`${day}၊ ${dd}-${mm}-${yyyy}`);
      setTime(
        myanmarTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center text-amber-300 font-mono">
      <div className="text-lg">{date}</div>
      <div className="text-sm">{time} (Myanmar Time)</div>
    </div>
  );
}
