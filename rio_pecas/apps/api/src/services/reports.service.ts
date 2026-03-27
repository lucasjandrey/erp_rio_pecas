import { prisma } from '../lib/prisma.js';

type DreFilters = {
  year?: number;
  month?: number;
  companyCode?: string;
};

export async function getDreReport(filters: DreFilters = {}) {
  const launches = await prisma.financialLaunch.findMany({
    where: {
      ...(filters.year ? { businessYear: filters.year } : {}),
      ...(filters.month ? { businessMonth: filters.month } : {}),
      ...(filters.companyCode ? { company: { code: filters.companyCode } } : {}),
    },
    include: { account: { include: { category: true } } },
  });

  const grouped = new Map<string, number>();
  for (const launch of launches) {
    const group = launch.account?.category?.dreGroup ?? launch.account?.groupName ?? 'Sem classificacao';
    grouped.set(group, (grouped.get(group) ?? 0) + Number(launch.revenueAmount ?? 0) - Number(launch.expenseAmount ?? 0));
  }

  const rows = Array.from(grouped.entries())
    .map(([group, total]) => ({
      group,
      total,
      absoluteTotal: Math.abs(total),
    }))
    .sort((a, b) => b.absoluteTotal - a.absoluteTotal)
    .map(({ absoluteTotal, ...row }) => row);

  const receitaTotal = rows.filter((item) => item.total > 0).reduce((acc, item) => acc + item.total, 0);

  return rows.map((item) => ({
    ...item,
    percentOfRevenue: receitaTotal > 0 ? (item.total / receitaTotal) * 100 : 0,
  }));
}

export async function getCashflowForecast() {
  return prisma.cashflowForecast.findMany({
    orderBy: [{ referenceDate: 'asc' }, { scenario: 'asc' }],
  });
}
