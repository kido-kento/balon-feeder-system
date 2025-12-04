"use client";

import { useEffect, useState } from "react";

type TodayResponse = {
  count: number;
  latest: string | null;
  limit: number;
};

export default function FeedingPage() {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // .env.local の値（なければ /api）
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

  // 今日の給餌状況を取得（表示用）
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

  // ご飯をあげる（ボタン or Siri から叩く用）
  const addFeeding = async () => {
    try {
      const res = await fetch(`${API_URL}/feeding`, {
        method: "POST",
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("addFeeding error:", e);
    }
  };

  // 🔥 今日の記録をリセット（ここが今回追加）
  const resetToday = async () => {
    try {
      await fetch(`${API_URL}/feeding/reset-today`);
      // 成功したら最新データを読み直す
      fetchToday();
    } catch (e) {
      console.error("resetToday error:", e);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">ばろんの飯ハラ</h1>

      {loading && <p className="text-lg">読み込み中…🐾</p>}

      {!loading && data && (
        <div className="text-center">
          <p className="text-2xl mb-4">
            今日：{data.count} / {data.limit} 回
          </p>

          <p className="text-lg opacity-80">
            最新：{data.latest ? data.latest : "なし"}
          </p>

          {/* 🍚 ご飯追加ボタン */}
          <button
            className="mt-8 px-6 py-3 bg-white text-black rounded-lg font-bold"
            onClick={addFeeding}
          >
            🍚 ご飯あげた！
          </button>

          {/* 🔥 今日の記録リセットボタン（新しく追加） */}
          <button
            className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg font-bold"
            onClick={resetToday}
          >
            ♻️ 今日の記録をリセット
          </button>
        </div>
      )}
    </div>
  );
}