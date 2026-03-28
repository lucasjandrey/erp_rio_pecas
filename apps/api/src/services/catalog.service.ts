import { prisma } from '../lib/prisma.js';

export async function getCatalogOptions() {
  const [companies, clients, paymentMethods, accounts, vendors] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: 'asc' } }),
    prisma.client.findMany({ orderBy: { name: 'asc' }, take: 50 }),
    prisma.paymentMethod.findMany({ orderBy: { name: 'asc' } }),
    prisma.chartOfAccount.findMany({ orderBy: { description: 'asc' }, take: 50 }),
    prisma.vendor.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return { companies, clients, paymentMethods, accounts, vendors };
}
