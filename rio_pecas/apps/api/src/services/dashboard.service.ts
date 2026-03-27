import { prisma } from '../lib/prisma.js';

type DashboardFilters = {
  companyCode?: string;
  year?: number;
  month?: number;
};

export async function getExecutiveDashboard(filters: DashboardFilters = {}) {
  const where = {
    ...(filters.companyCode ? { company: { code: filters.companyCode } } : {}),
    ...(filters.year ? { businessYear: filters.year } : {}),
    ...(filters.month ? { businessMonth: filters.month } : {}),
    isDuplicate: false,
  };

  const launches = await prisma.financialLaunch.findMany({
    where,
    include: { company: true },
    orderBy: [{ businessYear: 'asc' }, { businessMonth: 'asc' }],
  });

  const totals = launches.reduce(
    (acc, item) => {
      const revenueAmount = Number(item.revenueAmount ?? 0);
      const expenseAmount = Number(item.expenseAmount ?? 0);
      const totalSettledAmount = Number(item.totalSettledAmount ?? 0);
      const receivedAmount = Math.min(totalSettledAmount, revenueAmount);
      const paidAmount = Math.min(totalSettledAmount, expenseAmount);

      acc.faturamentoBruto += revenueAmount;
      acc.despesas += expenseAmount;
      acc.contasReceber += Math.max(revenueAmount - receivedAmount, 0);
      acc.contasPagar += Math.max(expenseAmount - paidAmount, 0);
      acc.recebido += receivedAmount;
      acc.pago += paidAmount;
      return acc;
    },
    { faturamentoBruto: 0, despesas: 0, contasReceber: 0, contasPagar: 0, recebido: 0, pago: 0 },
  );

  const forecast = await prisma.cashflowForecast.findMany({
    orderBy: { referenceDate: 'asc' },
  });

  const monthlyMap = new Map<string, { month: string; revenue: number; expense: number; settled: number }>();

  for (const item of launches) {
    const month = `${item.businessYear}-${String(item.businessMonth).padStart(2, '0')}`;
    const current = monthlyMap.get(month) ?? { month, revenue: 0, expense: 0, settled: 0 };
    current.revenue += Number(item.revenueAmount ?? 0);
    current.expense += Number(item.expenseAmount ?? 0);
    current.settled += Number(item.totalSettledAmount ?? 0);
    monthlyMap.set(month, current);
  }

  return {
    scope: filters.companyCode ?? 'CONSOLIDATED',
    kpis: {
      ...totals,
      saldo: Math.round((totals.recebido - totals.pago) * 100) / 100,
      previsaoCaixa: Number(forecast.find((item) => item.scenario === 'PROBABLE')?.projectedNet ?? 0),
      inadimplencia: launches.filter((item) => item.isCriticalLate).length,
    },
    monthlySeries: Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month)),
    forecast,
  };
}
