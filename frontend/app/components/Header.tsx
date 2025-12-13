"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 right-0 p-3 sm:p-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="text-white text-2xl sm:text-3xl hover:opacity-70 transition-opacity"
          aria-label="メニューを開く"
        >
          ☰
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={() => setOpen(false)}>
          <div className="absolute top-0 right-0 w-64 sm:w-72 md:w-80 h-full bg-gray-900 p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="text-white mb-4 sm:mb-6 hover:opacity-70 text-lg sm:text-xl"
              aria-label="メニューを閉じる"
            >
              ✕ 閉じる
            </button>

            <nav className="flex flex-col space-y-3 sm:space-y-4 text-white text-base sm:text-lg">
              <Link
                href="feeding"
                onClick={() => setOpen(false)}
                className="hover:opacity-70 font-bold"
              >
                🍚 今日
              </Link>

              <Link
                href="/weekly"
                onClick={() => setOpen(false)}
                className="hover:opacity-70"
              >
                📊 週間
              </Link>

              <Link
                href="/calendar"
                onClick={() => setOpen(false)}
                className="hover:opacity-70"
              >
                🗓 カレンダー
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}