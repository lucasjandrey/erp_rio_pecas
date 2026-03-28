import { describe, expect, it } from 'vitest';
import { calculateDelayDays, calculateDueDate, deriveStatus, isCriticalLate, normalizeMachineCondition } from './financial-rules.js';

describe('financial rules', () => {
  it('normalizes machine condition', () => {
    expect(normalizeMachineCondition('N')).toBe('NEW');
    expect(normalizeMachineCondition('u')).toBe('USED');
  });

  it('calculates due date', () => {
    const dueDate = calculateDueDate({ launchDate: new Date('2026-01-01'), dueDays: 30 });
    expect(dueDate?.toISOString().slice(0, 10)).toBe('2026-01-31');
  });

  it('marks overdue launch', () => {
    const status = deriveStatus({
      launchDate: new Date('2026-01-01'),
      revenueAmount: 1000,
      totalSettledAmount: 0,
      dueDays: 10,
      today: new Date('2026-02-01'),
    });
    expect(status).toBe('OVERDUE');
  });

  it('flags critical late launches', () => {
    const input = {
      launchDate: new Date('2025-10-01'),
      revenueAmount: 1000,
      dueDays: 10,
      today: new Date('2026-02-01'),
    };
    expect(calculateDelayDays(input)).toBeGreaterThan(90);
    expect(isCriticalLate(input)).toBe(true);
  });
});
