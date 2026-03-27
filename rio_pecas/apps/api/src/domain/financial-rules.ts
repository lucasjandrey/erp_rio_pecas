export type LaunchRuleInput = {
  launchDate: Date;
  dueDays?: number | null;
  dueDate?: Date | null;
  settlementDate?: Date | null;
  revenueAmount?: number | null;
  expenseAmount?: number | null;
  totalSettledAmount?: number | null;
  machineFlag?: string | null;
  today?: Date;
  criticalDelayDays?: number;
};

export function normalizeMachineCondition(flag?: string | null): 'NEW' | 'USED' | null {
  const normalized = flag?.trim().toUpperCase();
  if (normalized === 'N') return 'NEW';
  if (normalized === 'U') return 'USED';
  return null;
}

export function calculateDueDate(input: LaunchRuleInput): Date | null {
  if (input.dueDate) return input.dueDate;
  if (input.dueDays == null) return null;
  const due = new Date(input.launchDate);
  due.setDate(due.getDate() + input.dueDays);
  return due;
}

export function deriveStatus(input: LaunchRuleInput): 'OPEN' | 'OVERDUE' | 'PARTIAL' | 'SETTLED' {
  const total = (input.revenueAmount ?? 0) + (input.expenseAmount ?? 0);
  const settled = input.totalSettledAmount ?? 0;
  const dueDate = calculateDueDate(input);
  const today = input.today ?? new Date();

  if (settled > 0 && settled < total) return 'PARTIAL';
  if (settled >= total && total > 0) return 'SETTLED';
  if (dueDate && dueDate < today && !input.settlementDate) return 'OVERDUE';
  return 'OPEN';
}

export function calculateDelayDays(input: LaunchRuleInput): number {
  const dueDate = calculateDueDate(input);
  if (!dueDate || input.settlementDate) return 0;
  const today = input.today ?? new Date();
  const diff = today.getTime() - dueDate.getTime();
  return diff > 0 ? Math.floor(diff / 86400000) : 0;
}

export function isCriticalLate(input: LaunchRuleInput): boolean {
  return calculateDelayDays(input) >= (input.criticalDelayDays ?? 90);
}
