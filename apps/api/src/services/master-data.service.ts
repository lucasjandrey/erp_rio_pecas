import { Prisma, prisma } from '../lib/prisma.js';

type MasterDataScope = {
  companyCode?: string;
};

type ClientInput = {
  companyCode: string;
  code: string;
  name: string;
  legalName?: string | null;
  document?: string | null;
};

type VendorInput = {
  companyCode: string;
  code: string;
  name: string;
};

type CategoryInput = {
  companyCode: string;
  name: string;
  dreGroup?: string | null;
};

type AccountInput = {
  companyCode: string;
  code: string;
  description: string;
  groupName: string;
  fixedOrVariable?: string | null;
  categoryId?: string | null;
};

type PaymentMethodInput = {
  companyCode: string;
  code: string;
  name: string;
};

async function requireCompany(companyCode: string) {
  const company = await prisma.company.findUnique({ where: { code: companyCode } });
  if (!company) {
    throw new Error('Empresa nao encontrada para o cadastro.');
  }

  return company;
}

function companyScopedClientWhere(companyCode?: string): Prisma.ClientWhereInput {
  if (!companyCode) return {};
  return {
    OR: [{ company: { code: companyCode } }, { launches: { some: { company: { code: companyCode } } } }],
  };
}

function companyScopedVendorWhere(companyCode?: string): Prisma.VendorWhereInput {
  if (!companyCode) return {};
  return {
    OR: [{ company: { code: companyCode } }, { launches: { some: { company: { code: companyCode } } } }],
  };
}

function companyScopedAccountCategoryWhere(companyCode?: string): Prisma.AccountCategoryWhereInput {
  if (!companyCode) return {};
  return {
    OR: [
      { company: { code: companyCode } },
      { accounts: { some: { company: { code: companyCode } } } },
      { accounts: { some: { launches: { some: { company: { code: companyCode } } } } } },
    ],
  };
}

function companyScopedAccountWhere(companyCode?: string): Prisma.ChartOfAccountWhereInput {
  if (!companyCode) return {};
  return {
    OR: [{ company: { code: companyCode } }, { launches: { some: { company: { code: companyCode } } } }],
  };
}

function companyScopedPaymentMethodWhere(companyCode?: string): Prisma.PaymentMethodWhereInput {
  if (!companyCode) return {};
  return {
    OR: [{ company: { code: companyCode } }, { launches: { some: { company: { code: companyCode } } } }],
  };
}

export async function getMasterDataOverview(scope: MasterDataScope) {
  const [clients, vendors, categories, accounts, paymentMethods] = await Promise.all([
    prisma.client.count({ where: companyScopedClientWhere(scope.companyCode) }),
    prisma.vendor.count({ where: companyScopedVendorWhere(scope.companyCode) }),
    prisma.accountCategory.count({ where: companyScopedAccountCategoryWhere(scope.companyCode) }),
    prisma.chartOfAccount.count({ where: companyScopedAccountWhere(scope.companyCode) }),
    prisma.paymentMethod.count({ where: companyScopedPaymentMethodWhere(scope.companyCode) }),
  ]);

  return { clients, vendors, categories, accounts, paymentMethods };
}

export async function listClients(scope: MasterDataScope) {
  return prisma.client.findMany({
    where: companyScopedClientWhere(scope.companyCode),
    include: { company: true },
    orderBy: [{ name: 'asc' }],
  });
}

export async function createClient(input: ClientInput) {
  const company = await requireCompany(input.companyCode);

  return prisma.client.upsert({
    where: { code: input.code },
    update: {
      name: input.name,
      legalName: input.legalName ?? null,
      document: input.document ?? null,
      companyId: company.id,
    },
    create: {
      code: input.code,
      name: input.name,
      legalName: input.legalName ?? null,
      document: input.document ?? null,
      companyId: company.id,
    },
    include: { company: true },
  });
}

export async function updateClient(id: string, input: ClientInput) {
  const company = await requireCompany(input.companyCode);

  return prisma.client.update({
    where: { id },
    data: {
      code: input.code,
      name: input.name,
      legalName: input.legalName ?? null,
      document: input.document ?? null,
      companyId: company.id,
    },
    include: { company: true },
  });
}

export async function deleteClient(id: string) {
  return prisma.client.delete({ where: { id } });
}

export async function listVendors(scope: MasterDataScope) {
  return prisma.vendor.findMany({
    where: companyScopedVendorWhere(scope.companyCode),
    include: { company: true },
    orderBy: [{ name: 'asc' }],
  });
}

export async function createVendor(input: VendorInput) {
  const company = await requireCompany(input.companyCode);

  return prisma.vendor.upsert({
    where: { code: input.code },
    update: {
      name: input.name,
      companyId: company.id,
    },
    create: {
      code: input.code,
      name: input.name,
      companyId: company.id,
    },
    include: { company: true },
  });
}

export async function updateVendor(id: string, input: VendorInput) {
  const company = await requireCompany(input.companyCode);

  return prisma.vendor.update({
    where: { id },
    data: {
      code: input.code,
      name: input.name,
      companyId: company.id,
    },
    include: { company: true },
  });
}

export async function deleteVendor(id: string) {
  return prisma.vendor.delete({ where: { id } });
}

export async function listAccountCategories(scope: MasterDataScope) {
  return prisma.accountCategory.findMany({
    where: companyScopedAccountCategoryWhere(scope.companyCode),
    include: { company: true },
    orderBy: [{ name: 'asc' }],
  });
}

export async function createAccountCategory(input: CategoryInput) {
  const company = await requireCompany(input.companyCode);

  return prisma.accountCategory.upsert({
    where: { name: input.name },
    update: {
      dreGroup: input.dreGroup ?? input.name,
      companyId: company.id,
    },
    create: {
      name: input.name,
      dreGroup: input.dreGroup ?? input.name,
      companyId: company.id,
    },
    include: { company: true },
  });
}

export async function updateAccountCategory(id: string, input: CategoryInput) {
  const company = await requireCompany(input.companyCode);

  return prisma.accountCategory.update({
    where: { id },
    data: {
      name: input.name,
      dreGroup: input.dreGroup ?? input.name,
      companyId: company.id,
    },
    include: { company: true },
  });
}

export async function deleteAccountCategory(id: string) {
  return prisma.accountCategory.delete({ where: { id } });
}

export async function listChartOfAccounts(scope: MasterDataScope) {
  return prisma.chartOfAccount.findMany({
    where: companyScopedAccountWhere(scope.companyCode),
    include: { company: true, category: true },
    orderBy: [{ description: 'asc' }],
  });
}

export async function createChartOfAccount(input: AccountInput) {
  const company = await requireCompany(input.companyCode);

  return prisma.chartOfAccount.upsert({
    where: { code: input.code },
    update: {
      description: input.description,
      groupName: input.groupName,
      fixedOrVariable: input.fixedOrVariable ?? null,
      categoryId: input.categoryId ?? null,
      companyId: company.id,
    },
    create: {
      code: input.code,
      description: input.description,
      groupName: input.groupName,
      fixedOrVariable: input.fixedOrVariable ?? null,
      categoryId: input.categoryId ?? null,
      companyId: company.id,
    },
    include: { company: true, category: true },
  });
}

export async function updateChartOfAccount(id: string, input: AccountInput) {
  const company = await requireCompany(input.companyCode);

  return prisma.chartOfAccount.update({
    where: { id },
    data: {
      code: input.code,
      description: input.description,
      groupName: input.groupName,
      fixedOrVariable: input.fixedOrVariable ?? null,
      categoryId: input.categoryId ?? null,
      companyId: company.id,
    },
    include: { company: true, category: true },
  });
}

export async function deleteChartOfAccount(id: string) {
  return prisma.chartOfAccount.delete({ where: { id } });
}

export async function listPaymentMethods(scope: MasterDataScope) {
  return prisma.paymentMethod.findMany({
    where: companyScopedPaymentMethodWhere(scope.companyCode),
    include: { company: true },
    orderBy: [{ name: 'asc' }],
  });
}

export async function createPaymentMethod(input: PaymentMethodInput) {
  const company = await requireCompany(input.companyCode);

  return prisma.paymentMethod.upsert({
    where: { code: input.code },
    update: {
      name: input.name,
      companyId: company.id,
    },
    create: {
      code: input.code,
      name: input.name,
      companyId: company.id,
    },
    include: { company: true },
  });
}

export async function updatePaymentMethod(id: string, input: PaymentMethodInput) {
  const company = await requireCompany(input.companyCode);

  return prisma.paymentMethod.update({
    where: { id },
    data: {
      code: input.code,
      name: input.name,
      companyId: company.id,
    },
    include: { company: true },
  });
}

export async function deletePaymentMethod(id: string) {
  return prisma.paymentMethod.delete({ where: { id } });
}
