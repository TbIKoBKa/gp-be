import { aggregateRegistrations, mskDate, mskDayEnd, mskDayStart, PLAYED_THRESHOLD_SEC } from './partner-stats';

describe('partner-stats', () => {
  const row = (regDate: number, extra: Partial<{ playtimeSec: number; returnAt: number | null; ip: string; bedrock: boolean }> = {}) => ({
    regDate,
    playtimeSec: 0,
    returnAt: null,
    ip: '1.1.1.1',
    bedrock: false,
    ...extra,
  });

  it('мск-день сдвинут на +3 часа от UTC', () => {
    // 2026-10-04 22:30 UTC = 2026-10-05 01:30 МСК
    expect(mskDate(Date.parse('2026-10-04T22:30:00Z'))).toBe('2026-10-05');
    expect(mskDate(Date.parse('2026-10-04T20:59:59Z'))).toBe('2026-10-04');
  });

  it('границы дня по МСК', () => {
    expect(mskDayStart('2026-10-05')).toBe(Date.parse('2026-10-04T21:00:00Z'));
    expect(mskDayEnd('2026-10-05')).toBe(Date.parse('2026-10-05T20:59:59.999Z'));
    expect(mskDayStart('05.10.2026')).toBeNull();
    expect(mskDayStart('2026-13-45')).toBeNull();
  });

  it('считает итоги и качество', () => {
    const from = mskDayStart('2026-10-01')!;
    const to = mskDayEnd('2026-10-03')!;
    const rows = [
      row(Date.parse('2026-10-01T10:00:00Z'), { playtimeSec: PLAYED_THRESHOLD_SEC, ip: 'a' }),
      row(Date.parse('2026-10-01T11:00:00Z'), { playtimeSec: PLAYED_THRESHOLD_SEC - 1, ip: 'a' }),
      row(Date.parse('2026-10-03T12:00:00Z'), { returnAt: Date.parse('2026-10-04T12:00:00Z'), ip: 'b', bedrock: true }),
    ];

    const { totals, byDay } = aggregateRegistrations(rows, from, to);

    expect(totals).toEqual({ registrations: 3, played: 1, returned: 1, uniqueIps: 2, bedrock: 1 });
    expect(byDay).toEqual([
      { date: '2026-10-01', registrations: 2, played: 1, returned: 0 },
      { date: '2026-10-02', registrations: 0, played: 0, returned: 0 },
      { date: '2026-10-03', registrations: 1, played: 0, returned: 1 },
    ]);
  });

  it('пустой период - нули по каждому дню', () => {
    const { totals, byDay } = aggregateRegistrations([], mskDayStart('2026-10-05')!, mskDayEnd('2026-10-05')!);
    expect(totals.registrations).toBe(0);
    expect(byDay).toEqual([{ date: '2026-10-05', registrations: 0, played: 0, returned: 0 }]);
  });
});
