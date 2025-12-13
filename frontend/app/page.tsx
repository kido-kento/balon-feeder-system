"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // トップページにアクセスしたら、自動的に給餌記録ページへリダイレクト
    router.push("/feeding");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">給餌記録ページへ移動中...</p>
      </div>
    </div>
  );
}
