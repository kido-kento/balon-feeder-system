<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FeedingController; // ← これ追加！！！（超重要）


/**
 * API Routes
 *
 * このファイルはアプリケーションのAPIルートを定義します。
 * これらのルートは自動的に `/api` プレフィックスが付与されます。
 */

// ヘルスチェックエンドポイント
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API is running',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// 認証されたユーザー情報を取得（例）
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// 予約システムのAPIルートをここに追加していきます
// 例:
// Route::apiResource('reservations', ReservationController::class);
// Route::apiResource('users', UserController::class);
// Route::apiResource('services', ServiceController::class);

// =============================================
// ▼ ここからバロン給餌システムのルート追加 ▼
// =============================================

// 給餌記録を保存（POST）
Route::post('/feeding', [FeedingController::class, 'store']);

// 今日の給餌状況を取得（GET）
Route::get('/feeding/today', [FeedingController::class, 'today']);