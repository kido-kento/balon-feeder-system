"use client";

import { useState, useEffect } from "react";

export default function FeedingPage() {
  const [count, setCount] = useState(0);
  const [latest, setLatest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 今日の給餌状況を取得
  async function fetchToday() {
    const res = await fetch(`${API_URL}/feeding/today`);
    const data = await res.json();
    setCount(data.count);
    setLatest(data.latest);
    setLoading(false);
  }

  // ご飯をあげる
  async function addFeeding() {
    await fetch(`${API_URL}/feeding`, {
      method: "POST",
    });
    await fetchToday(); // 更新
  }

  useEffect(() => {
    fetchToday();
  }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>🍚 バロンの給餌ログ</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <>
          <p>今日の回数：<strong>{count}</strong> / 6</p>
          <p>最新給餌：{latest ? latest : "なし"}</p>

          <button
            onClick={addFeeding}
            style={{
              marginTop: "20px",
              padding: "15px 25px",
              fontSize: "18px",
              fontWeight: "bold",
              background: "#3b82f6",
              color: "white",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
            }}
          >
            🍽 ご飯あげた！
          </button>
        </>
      )}
    </div>
  );
}