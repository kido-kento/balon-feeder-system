<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FeedingController extends Controller
{
    /**
     * 今日の開始時刻（AM 4:00起点）
     */
    private function getTodayStart(): Carbon
    {
        $now = Carbon::now();

        // 今日の 4:00
        $start = Carbon::today()->addHours(4);

        // 今が 4:00 より前なら「前日の4:00」からを今日扱い
        if ($now->hour < 4) {
            $start = Carbon::yesterday()->addHours(4);
        }

        return $start;
    }

    /**
     * POST /api/feeding
     * 明示的に1回記録する（ボタン or Siri 専用）
     */
    public function store(Request $request)
    {
        $now   = Carbon::now();
        $start = $this->getTodayStart();

        // 1件追加
        DB::table('feedings')->insert([
            'feeding_time' => $now,
            'amount'       => 10,
            'created_at'   => $now,
            'updated_at'   => $now,
        ]);

        // 今日分を集計
        $feedings = DB::table('feedings')
            ->where('feeding_time', '>=', $start)
            ->orderBy('feeding_time', 'desc')
            ->get();

        return response()->json([
            'message' => 'Feeding recorded successfully',
            'count'   => $feedings->count(),
            'latest'  => $feedings->first()?->feeding_time,
            'limit'   => 6,
        ]);
    }

    /**
     * GET /api/feeding/today
     * 今日（4:00起点）の統計を返す
     */
    public function today()
    {
        $start = $this->getTodayStart();

        $feedings = DB::table('feedings')
            ->where('feeding_time', '>=', $start)
            ->orderBy('feeding_time', 'desc')
            ->get();

        return response()->json([
            'count'  => $feedings->count(),
            'latest' => $feedings->first()?->feeding_time,
            'limit'  => 6,
        ]);
    }
    /**
     * GET /api/feeding/reset-today
     * 今日(AM4:00起点)の記録を全部リセット
     */
    public function resetToday()
    {
        // 今日の開始（4時）- getTodayStart()を使って統一
        $start = $this->getTodayStart();

        // 今日分のレコードを全部削除
        DB::table('feedings')
            ->where('feeding_time', '>=', $start)
            ->delete();

        return response()->json([
            'message' => 'Today feedings reset successfully',
        ]);
    }
}
