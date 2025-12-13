"use client";

import { useEffect, useState } from "react";
import { getFeedingSlot, getDisplayHour } from "./utils";

type FeedingRecord = {
  id: number;
  time: string; // "HH:mm"
  full_time: string; // "YYYY-MM-DD HH:mm:ss"
};

type DayRecord = {
  date: string;
  count: number;
  records: FeedingRecord[];
};

type WeeklyResponse = {
  days: DayRecord[];
};

export default function CalendarPage() {
  const [data, setData] = useState<WeeklyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

  /**
   * 指定した週の開始日から7日分のデータを取得
   */
  const fetchWeek = async (startDate: string) => {
    try {
      const res = await fetch(`${API_URL}/feeding/weekly?start_date=${startDate}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("fetchWeek error:", e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 今週の開始日（日曜日）を計算
   */
  const getThisWeekStart = (): string => {
    const now = new Date();
    const day = now.getDay(); // 0 (日曜) ~ 6 (土曜)
    const diff = day; // 日曜日からの差分
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - diff);
    return sunday.toISOString().split("T")[0];
  };

  /**
   * 前の週へ
   */
  const goToPrevWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - 7);
    const newStart = date.toISOString().split("T")[0];
    setCurrentWeekStart(newStart);
    fetchWeek(newStart);
  };

  /**
   * 次の週へ
   */
  const goToNextWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 7);
    const newStart = date.toISOString().split("T")[0];
    setCurrentWeekStart(newStart);
    fetchWeek(newStart);
  };

  /**
   * 今週へ戻る
   */
  const goToThisWeek = () => {
    const thisWeek = getThisWeekStart();
    setCurrentWeekStart(thisWeek);
    fetchWeek(thisWeek);
  };

  /**
   * 編集
   */
  const handleEdit = async (record: FeedingRecord, date: string) => {
    const input = window.prompt(
      `現在: ${record.time}\n新しい時刻を HH:mm で入力してください`,
      record.time
    );

    if (input === null || input === "") return;

    try {
      const newFeedingTime = `${date} ${input}:00`;
      await fetch(`${API_URL}/feeding/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_feeding_time: newFeedingTime,
        }),
      });

      // データを再取得して反映
      await fetchWeek(currentWeekStart);
    } catch (e) {
      console.error("handleEdit error:", e);
      alert("エラーが発生しました");
    }
  };

  /**
   * 削除
   */
  const handleDelete = async (record: FeedingRecord) => {
    if (!window.confirm(`${record.time} の記録を削除しますか？`)) return;

    try {
      await fetch(`${API_URL}/feeding/${record.id}`, {
        method: "DELETE",
      });

      // データを再取得して反映
      await fetchWeek(currentWeekStart);
    } catch (e) {
      console.error("handleDelete error:", e);
      alert("エラーが発生しました");
    }
  };

  /**
   * 初期ロード
   */
  useEffect(() => {
    const thisWeek = getThisWeekStart();
    setCurrentWeekStart(thisWeek);
    fetchWeek(thisWeek);
  }, []);

  /**
   * 4時起点スロット：4〜27（27 = 翌3時）
   */
  const slots = Array.from({ length: 24 }, (_, i) => i + 4);

  /**
   * 曜日ラベル
   */
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  /**
   * 日付から曜日インデックスを取得
   */
  const getDayOfWeek = (dateStr: string): number => {
    return new Date(dateStr).getDay();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 sm:p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          🗓 カレンダー（AM4:00起点）
        </h1>

        {/* ナビゲーション */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevWeek}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm"
          >
            ← 前週
          </button>
          <button
            onClick={goToThisWeek}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            今週
          </button>
          <button
            onClick={goToNextWeek}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm"
          >
            次週 →
          </button>
        </div>
      </div>

      {loading && <p>読み込み中…</p>}

      {!loading && data && (
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* ヘッダー行（日付と曜日） */}
            <div className="grid grid-cols-8 border-b border-white/20">
              <div className="p-2 text-xs text-white/50">時刻</div>
              {data.days.map((day) => {
                const dayOfWeek = getDayOfWeek(day.date);
                const weekdayLabel = weekdays[dayOfWeek];
                const today = new Date().toISOString().split("T")[0];
                const isToday = day.date === today;

                return (
                  <div
                    key={day.date}
                    className={`p-2 text-center border-l border-white/10 ${
                      isToday ? "bg-blue-900/30" : ""
                    }`}
                  >
                    <div className="text-xs opacity-70">{weekdayLabel}</div>
                    <div className={`text-sm font-bold ${isToday ? "text-blue-400" : ""}`}>
                      {day.date.split("-")[2]}日
                    </div>
                  </div>
                );
              })}
            </div>

            {/* タイムライン */}
            {slots.map((slot) => {
              const displayHour = getDisplayHour(slot);

              return (
                <div key={slot} className="grid grid-cols-8 border-b border-white/5 hover:bg-white/5">
                  {/* 時刻ラベル */}
                  <div className="p-2 text-xs text-white/50 border-r border-white/10">
                    {displayHour.toString().padStart(2, "0")}:00
                  </div>

                  {/* 各日のセル */}
                  {data.days.map((day) => {
                    const hits = day.records
                      .filter((r) => getFeedingSlot(r.time) === slot)
                      .sort((a, b) => a.time.localeCompare(b.time));

                    return (
                      <div
                        key={`${day.date}-${slot}`}
                        className="p-1 border-l border-white/5 min-h-[40px]"
                      >
                        {hits.map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center gap-1 mb-1"
                          >
                            <button
                              onClick={() => handleEdit(record, day.date)}
                              className="flex-1 text-left px-2 py-1 text-xs bg-green-600/80 hover:bg-green-500 rounded"
                            >
                              {record.time}
                            </button>
                            <button
                              onClick={() => handleDelete(record)}
                              className="px-2 py-1 text-xs bg-red-600/80 hover:bg-red-500 rounded"
                              aria-label="削除"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
