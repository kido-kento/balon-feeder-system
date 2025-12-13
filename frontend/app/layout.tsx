import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "ばろんの飯ハラ",
  description: "バロンのご飯管理システム",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="relative">
        {/* ハンバーガーメニュー */}
        <Header />

        {/* 各ページの中身 */}
        {children}
      </body>
    </html>
  );
}