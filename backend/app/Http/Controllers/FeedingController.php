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
     * feeding_time を「バロン家の日付」に変換する（AM4:00区切り）
     * 例）2025-12-13 03:30 → 前日扱い
     */
    private function toBalonDayKey(Carbon $dt): string
    {
        return $dt->copy()->subHours(4)->format('Y-m-d');
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
        /**
     * GET /api/feeding/weekly?start_date=2025-12-07
     * 指定した日付から7日分（AM4:00起点）のログを返す
     * start_date を省略した場合は今日から過去6日分
     */
    public function weekly(Request $request)
    {
        // start_date パラメータがあればそれを使用、なければ今日
        if ($request->has('start_date')) {
            $startDate = Carbon::parse($request->start_date)->addHours(4);
        } else {
            $startDate = $this->getTodayStart()->subDays(6);
        }

        $endDate = $startDate->copy()->addDays(6)->endOfDay();

        $rows = DB::table('feedings')
            ->where('feeding_time', '>=', $startDate)
            ->where('feeding_time', '<=', $endDate)
            ->orderBy('feeding_time', 'asc')
            ->get(['id', 'feeding_time']);

        // 7日分の枠を先に作る（0回の日も出すため）
        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $dayStart = $startDate->copy()->addDays($i);
            $key = $this->toBalonDayKey($dayStart);

            $days[$key] = [
                'date'  => $key,
                'count' => 0,
                'records' => [], // [{id, time}]
            ];
        }

        foreach ($rows as $r) {
            $dt = Carbon::parse($r->feeding_time);
            $key = $this->toBalonDayKey($dt);

            if (!isset($days[$key])) continue;

            $days[$key]['count']++;
            $days[$key]['records'][] = [
                'id'   => $r->id,
                'time' => $dt->format('H:i'),
                'full_time' => $r->feeding_time,
            ];
        }

        $dayList = array_values($days);

        $total = array_sum(array_column($dayList, 'count'));
        $avg = round($total / 7, 2);

        $underfedDays = array_values(array_map(
            fn($d) => $d['date'],
            array_filter($dayList, fn($d) => $d['count'] < 5)
        ));

        return response()->json([
            'avg'          => $avg,
            'underfedDays' => $underfedDays,
            'days'         => $dayList,
        ]);
    }
        /**
     * DELETE /api/feeding/{id}
     * IDを指定して1件削除
     */
    public function delete($id)
    {
        DB::table('feedings')
            ->where('id', $id)
            ->delete();

        return response()->json([
            'message' => 'Feeding deleted',
        ]);
    }

    /**
     * PUT /api/feeding/{id}
     * IDを指定して時刻を更新
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'new_feeding_time' => 'required|date',
        ]);

        $updated = DB::table('feedings')
            ->where('id', $id)
            ->update([
                'feeding_time' => $request->new_feeding_time,
                'updated_at'   => Carbon::now(),
            ]);

        return response()->json([
            'message' => 'Feeding updated',
            'updated' => $updated,
        ]);
    }
}
