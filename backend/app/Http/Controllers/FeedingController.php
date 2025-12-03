<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FeedingController extends Controller
{
    /**
     * POST /api/feeding
     * 記録を1件追加
     */
    public function store(Request $request)
{
    // 給餌を1件追加
    DB::table('feedings')->insert([
        'feeding_time' => Carbon::now(),
        'amount' => 10,
        'created_at' => Carbon::now(),
        'updated_at' => Carbon::now(),
    ]);

    // 今日の開始（2時）
    $start = Carbon::today()->addHours(2);
    if (Carbon::now()->hour < 2) {
        $start = Carbon::yesterday()->addHours(2);
    }

    // 今日のデータを再度集計
    $feedings = DB::table('feedings')
        ->where('feeding_time', '>=', $start)
        ->orderBy('feeding_time', 'desc')
        ->get();

    return response()->json([
        'message' => 'Feeding recorded successfully',
        'count'   => $feedings->count(),                     // 今日の回数
        'latest'  => $feedings->first()?->feeding_time,      // 最新給餌
        'limit'   => 6                                        // 上限数
    ]);
}

    /**
     * GET /api/feeding/today
     * 今日（AM 2:00起点）の統計を返す
     */
    public function today()
    {
        // 今日の開始時刻：AM 2:00（バロン家の生活リズム対応）
        $start = Carbon::today()->addHours(2);

        // 今がAM 2時前なら、前日の2時が開始時刻
        if (Carbon::now()->hour < 2) {
            $start = Carbon::yesterday()->addHours(2);
        }

        // 今日のデータを取得
        $feedings = DB::table('feedings')
            ->where('feeding_time', '>=', $start)
            ->orderBy('feeding_time', 'desc')
            ->get();

        return response()->json([
            'count' => $feedings->count(),
            'latest' => $feedings->first()?->feeding_time,
        ]);
    }
}