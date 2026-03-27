import { prisma } from '../lib/prisma.js';

type FinanceFilters = {
  companyCode?: string;
  year?: number;
  month?: number;
  status?: string;
};

function buildWhere(filters: FinanceFilters) {
  return {
    ...(filters.companyCode ? { company: { code: filters.companyCode } } : {}),
    ...(filters.year ? { businessYear: filters.year } : {}),
    ...(filters.month ? { businessMonth: filters.month } : {}),
    ...(filters.status ? { financialStatus: filters.status as never } : {}),
  };
}

export async function getReceivablesOverview(filters: FinanceFilters = {}) {
  const launches = await prisma.financialLaunch.findMany({
    where: {
      ...buildWhere(filters),
      revenueAmount: { gt: 0 },
    },
    include: {
      company: true,
      client: true,
      paymentMethod: true,
    },
    orderBy: { dueDate: 'asc' },
  });

  const summary = launches.reduce(
    (acc, item) => {
      const revenue = Number(item.revenueAmount ?? 0);
      const settled = Number(item.totalSettledAmount ?? 0);
      const openAmount = Math.max(revenue - settled, 0);
      acc.total += revenue;
      acc.open += openAmount;
      acc.settled += settled;
      if (item.financialStatus === 'OVERDUE') acc.overdue += openAmount;
      return acc;
    },
    { total: 0, open: 0, settled: 0, overdue: 0 },
  );

  const topDebtorsMap = new Map<string, { clientName: string; totalOpen: number; companies: Set<string> }>();
  for (const item of launches) {
    const clientName = item.client?.name ?? 'Sem cliente';
    const key = item.clientId ?? clientName;
    const current = topDebtorsMap.get(key) ?? { clientName, totalOpen: 0, companies: new Set<string>() };
    current.totalOpen += Math.max(Number(item.revenueAmount ?? 0) - Number(item.totalSettledAmount ?? 0), 0);
    current.companies.add(item.company.shortName);
    topDebtorsMap.set(key, current);
  }

  const topDebtors = Array.from(topDebtorsMap.values())
    .sort((a, b) => b.totalOpen - a.totalOpen)
    .slice(0, 10)
    .map((item) => ({
      clientName: item.clientName,
      totalOpen: item.totalOpen,
      companies: Array.from(item.companies),
    }));

  return {
    summary,
    topDebtors,
    items: launches.slice(0, 50),
  };
}

export async function getPayablesOverview(filters: FinanceFilters = {}) {
  const launches = await prisma.financialLaunch.findMany({
    where: {
      ...buildWhere(filters),
      expenseAmount: { gt: 0 },
    },
    include: {
      company: true,
      account: true,
      paymentMethod: true,
    },
    orderBy: { dueDate: 'asc' },
  });

  const summary = launches.reduce(
    (acc, item) => {
      const expense = Number(item.expenseAmount ?? 0);
      const settled = Number(item.totalSettledAmount ?? 0);
      const openAmount = Math.max(expense - settled, 0);
      acc.total += expense;
      acc.open += openAmount;
      acc.paid += settled;
      if (item.financialStatus === 'OVERDUE') acc.overdue += openAmount;
      return acc;
    },
    { total: 0, open: 0, paid: 0, overdue: 0 },
  );

  const topAccountsMap = new Map<string, { accountName: string; total: number }>();
  for (const item of launches) {
    const accountName = item.account?.groupName ?? item.account?.description ?? 'Sem conta';
    const current = topAccountsMap.get(accountName) ?? { accountName, total: 0 };
    current.total += Number(item.expenseAmount ?? 0);
    topAccountsMap.set(accountName, current);
  }

  const topAccounts = Array.from(topAccountsMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return {
    summary,
    topAccounts,
    items: launches.slice(0, 50),
  };
}

export async function getReceivableVsPayableReport(filters: FinanceFilters = {}) {
  const launches = await prisma.financialLaunch.findMany({
    where: buildWhere(filters),
    include: { company: true },
    orderBy: [{ businessYear: 'asc' }, { businessMonth: 'asc' }],
  });

  const monthlyMap = new Map<
    string,
    {
      month: string;
      receivable: number;
      payable: number;
      settled: number;
      net: number;
    }
  >();

  for (const item of launches) {
    const key = `${item.businessYear}-${String(item.businessMonth).padStart(2, '0')}`;
    const current = monthlyMap.get(key) ?? { month: key, receivable: 0, payable: 0, settled: 0, net: 0 };
    current.receivable += Number(item.revenueAmount ?? 0);
    current.payable += Number(item.expenseAmount ?? 0);
    current.settled += Number(item.totalSettledAmount ?? 0);
    current.net = current.receivable - current.payable;
    monthlyMap.set(key, current);
  }

  const series = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  const totals = series.reduce(
    (acc, item) => {
      acc.receivable += item.receivable;
      acc.payable += item.payable;
      acc.net += item.net;
      return acc;
    },
    { receivable: 0, payable: 0, net: 0 },
  );

  return {
    totals,
    series,
  };
}
