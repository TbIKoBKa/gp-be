/**
 * Агрегация регистраций кампании. Чистые функции без БД: их покрывает partner-stats.spec.ts.
 *
 * Дни считаются по Москве. МСК - фиксированные UTC+3 без перехода на летнее время с 2014 года,
 * поэтому смещение константа, а не таймзона.
 */

const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Сколько надо провести в игре, чтобы регистрация считалась «живой», а не твинком. */
export const PLAYED_THRESHOLD_SEC = 30 * 60;

export interface RegistrationRow {
  regDate: number;
  playtimeSec: number;
  returnAt: number | null;
  ip: string;
  bedrock: boolean;
}

export interface DayStats {
  /** День по МСК, `YYYY-MM-DD`. */
  date: string;
  registrations: number;
  played: number;
  returned: number;
}

export interface Totals {
  registrations: number;
  /** Провели в игре не меньше {@link PLAYED_THRESHOLD_SEC}. */
  played: number;
  /** Зашли снова в другой день по МСК. */
  returned: number;
  uniqueIps: number;
  bedrock: number;
}

export interface Aggregated {
  totals: Totals;
  byDay: DayStats[];
}

/** `YYYY-MM-DD` по МСК для момента в миллисекундах. */
export function mskDate(ms: number): string {
  return new Date(ms + MSK_OFFSET_MS).toISOString().slice(0, 10);
}

/** Начало дня `YYYY-MM-DD` по МСК в миллисекундах. Кривая строка - `null`. */
export function mskDayStart(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const utc = Date.parse(`${date}T00:00:00Z`);
  return Number.isNaN(utc) ? null : utc - MSK_OFFSET_MS;
}

/** Конец дня `YYYY-MM-DD` по МСК (последняя миллисекунда). */
export function mskDayEnd(date: string): number | null {
  const start = mskDayStart(date);
  return start === null ? null : start + DAY_MS - 1;
}

/**
 * Итоги и разбивка по дням. Дни без регистраций внутри периода заполняются нулями,
 * чтобы на графике не было дыр.
 */
export function aggregateRegistrations(rows: RegistrationRow[], fromMs: number, toMs: number): Aggregated {
  const days = new Map<string, DayStats>();
  for (let t = fromMs; mskDate(t) <= mskDate(toMs); t += DAY_MS) {
    const date = mskDate(t);
    days.set(date, { date, registrations: 0, played: 0, returned: 0 });
  }

  const totals: Totals = { registrations: 0, played: 0, returned: 0, uniqueIps: 0, bedrock: 0 };
  const ips = new Set<string>();

  for (const row of rows) {
    const played = row.playtimeSec >= PLAYED_THRESHOLD_SEC;
    const returned = row.returnAt !== null && row.returnAt > 0;

    totals.registrations++;
    if (played) totals.played++;
    if (returned) totals.returned++;
    if (row.bedrock) totals.bedrock++;
    ips.add(row.ip);

    const date = mskDate(row.regDate);
    let day = days.get(date);
    if (!day) {
      day = { date, registrations: 0, played: 0, returned: 0 };
      days.set(date, day);
    }
    day.registrations++;
    if (played) day.played++;
    if (returned) day.returned++;
  }

  totals.uniqueIps = ips.size;
  const byDay = [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
  return { totals, byDay };
}
