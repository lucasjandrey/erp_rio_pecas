import { prisma } from '../lib/prisma.js';

export async function listLaunches(query: Record<string, string | undefined>) {
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 20);
  const where = {
    ...(query.companyCode ? { company: { code: query.companyCode } } : {}),
    ...(query.status ? { financialStatus: query.status as never } : {}),
    ...(query.year ? { businessYear: Number(query.year) } : {}),
    ...(query.month ? { businessMonth: Number(query.month) } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.financialLaunch.findMany({
      where,
      include: { company: true, client: true, account: true, paymentMethod: true, vendor: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { launchDate: 'desc' },
    }),
    prisma.financialLaunch.count({ where }),
  ]);

  return { page, pageSize, total, items };
}

export async function getLaunchById(id: string) {
  return prisma.financialLaunch.findUnique({
    where: { id },
    include: { company: true, client: true, account: true, vendor: true, paymentMethod: true, installments: true },
  });
}
