/**
 * feeding の時刻 "HH:mm" を
 * 「4時起点カレンダー用のスロット番号」に変換する
 *
 * 例:
 * 02:21 → 26
 * 04:00 → 4
 * 23:10 → 23
 */
export function getFeedingSlot(time: string): number {
    const hour = Number(time.split(":")[0]);
  
    // 0〜3時は「翌日扱い」→ 24〜27
    if (hour < 4) {
      return hour + 24;
    }
  
    return hour;
  }
  
  /**
   * スロット番号（4〜27）を
   * 表示用の時刻（0〜23）に戻す
   *
   * 例:
   * 26 → 2
   */
  export function getDisplayHour(slot: number): number {
    return slot >= 24 ? slot - 24 : slot;
  }