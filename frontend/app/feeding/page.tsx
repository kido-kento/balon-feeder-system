"use client";

import { useEffect, useState } from "react";

/* ========= 型定義 ========= */

type TodayResponse = {
  count: number;
  latest: string | null;
  limit: number;
};

type WeeklyDay = {
  date: string;
  count: number;
  times: string[];
};

type WeeklyResponse = {
  avg: number;
  underfedDays: string[];
  days: WeeklyDay[];
};

/* ========= コンポーネント ========= */

export default function FeedingPage() {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [weekly, setWeekly] = useState<WeeklyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // .env.local の値（なければ /api）
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

  /* ===== 今日の給餌状況 ===== */

  const fetchToday = async () => {
    try {
      const res = await fetch(`${API_URL}/feeding/today`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("fetchToday error:", e);
    } finally {
      setLoading(false);
    }
  };

  /* ===== 週間データ ===== */

  const fetchWeekly = async () => {
    try {
      const res = await fetch(`${API_URL}/feeding/weekly`);
      const json = await res.json();
      setWeekly(json);
    } catch (e) {
      console.error("fetchWeekly error:", e);
    }
  };

  /* ===== ご飯をあげる ===== */

  const addFeeding = async () => {
    try {
      const res = await fetch(`${API_URL}/feeding`, {
        method: "POST",
      });
      const json = await res.json();
      setData(json);
      fetchWeekly(); // 週間も更新
    } catch (e) {
      console.error("addFeeding error:", e);
    }
  };

  /* ===== 今日をリセット ===== */

  const resetToday = async () => {
    try {
      await fetch(`${API_URL}/feeding/reset-today`);
      fetchToday();
      fetchWeekly();
    } catch (e) {
      console.error("resetToday error:", e);
    }
  };

  /* ===== 初期ロード ===== */

  useEffect(() => {
    fetchToday();
    fetchWeekly();
  }, []);

  /* ========= JSX ========= */

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white p-4 sm:p-6 md:p-8"
      style={{
        backgroundImage: "url(/balon-background.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm sm:max-w-md md:max-w-lg px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 drop-shadow-lg text-center">
          ばろんの飯ハラ
        </h1>

        {loading && <p className="text-lg">読み込み中…🐾</p>}

        {!loading && data && (
          <>
            {/* ===== 今日 ===== */}
            <div className="text-center mb-6 sm:mb-8 w-full">
              <p className="text-xl sm:text-2xl md:text-3xl mb-2">
                今日：{data.count} / {data.limit} 回
              </p>

              <p className="text-xs sm:text-sm opacity-80">
                最新：{data.latest ?? "なし"}
              </p>

              <button
                className="mt-4 sm:mt-6 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-lg font-bold hover:bg-gray-200 shadow-lg text-base sm:text-lg w-full sm:w-auto"
                onClick={addFeeding}
              >
                🍚 ご飯あげた！
              </button>

              <button
                className="mt-3 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 text-sm sm:text-base w-full sm:w-auto"
                onClick={resetToday}
              >
                ♻️ 今日の記録をリセット
              </button>
            </div>

            
          </>
        )}
      </div>
    </div>
  );
}