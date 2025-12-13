"use client";

import { useEffect, useState } from "react";

type DayData = {
  date: string;
  count: number;
  times: string[];
};

type WeeklyResponse = {
  avg: number;
  underfedDays: string[];
  days: DayData[];
};

export default function WeeklyPage() {
  const [data, setData] = useState<WeeklyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

  const fetchWeekly = async () => {
    try {
      const res = await fetch(`${API_URL}/feeding/weekly`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("fetchWeekly error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekly();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8 pt-16 sm:pt-20">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">📊 直近7日</h1>

      {loading && <p className="text-base sm:text-lg">読み込み中…</p>}

      {!loading && data && (
        <div className="space-y-3 sm:space-y-4">
          <p className="mb-4 text-lg sm:text-xl md:text-2xl">
            週間平均：<span className="font-bold">{data.avg}</span> 回
          </p>

          <div className="space-y-2 sm:space-y-3">
            {data.days.map((day) => {
              const isUnder = day.count < 5;

              return (
                <div
                  key={day.date}
                  className={`flex justify-between rounded px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-sm sm:text-base md:text-lg ${
                    isUnder ? "bg-red-900/60" : "bg-white/10"
                  }`}
                >
                  <span>{day.date}</span>
                  <span className="font-bold">
                    {day.count} 回
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}