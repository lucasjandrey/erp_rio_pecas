import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, FinancialStatus, ForecastScenario, MachineCondition, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const rio = await prisma.company.upsert({
    where: { code: '1' },
    update: {},
    create: { code: '1', name: 'Rio Peças', shortName: 'RP' },
  });

  const receita = await prisma.accountCategory.upsert({
    where: { name: 'Receitas' },
    update: {},
    create: { name: 'Receitas', dreGroup: 'Receitas' },
  });

  const conta = await prisma.chartOfAccount.upsert({
    where: { code: '1' },
    update: {},
    create: {
      code: '1',
      groupName: 'Receitas',
      description: 'Venda de Peças',
      categoryId: receita.id,
    },
  });

  const boleto = await prisma.paymentMethod.upsert({
    where: { code: '7' },
    update: {},
    create: { code: '7', name: 'Boleto' },
  });

  const cliente = await prisma.client.upsert({
    where: { code: '1' },
    update: {},
    create: {
      code: '1',
      name: 'A.S CONFECÇÕES',
      legalName: 'A.S OLIVEIRA CONFECÇÕES LTDA',
      document: '53.858.847/0001-78',
    },
  });

  const vendedor = await prisma.vendor.upsert({
    where: { code: 'V001' },
    update: {},
    create: { code: 'V001', name: 'Equipe Comercial' },
  });

  await prisma.user.upsert({
    where: { email: 'admin@riopecas.local' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@riopecas.local',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const launch = await prisma.financialLaunch.create({
    data: {
      launchDate: new Date('2026-01-15'),
      companyId: rio.id,
      clientId: cliente.id,
      accountId: conta.id,
      vendorId: vendedor.id,
      paymentMethodId: boleto.id,
      description: 'Venda de peças de reposição',
      revenueAmount: 154163,
      expenseAmount: 0,
      machinesQuantity: 2,
      machineCondition: MachineCondition.NEW,
      dueDays: 30,
      dueDate: new Date('2026-02-14'),
      totalSettledAmount: 50000,
      financialStatus: FinancialStatus.PARTIAL,
      businessYear: 2026,
      businessMonth: 1,
      dueYear: 2026,
      dueMonth: 2,
    },
  });

  await prisma.financialInstallment.createMany({
    data: [
      {
        launchId: launch.id,
        installmentNo: 1,
        dueDate: new Date('2026-02-14'),
        amount: 77081.5,
        settledAmount: 50000,
        settlementDate: new Date('2026-02-13'),
        status: FinancialStatus.PARTIAL,
      },
      {
        launchId: launch.id,
        installmentNo: 2,
        dueDate: new Date('2026-03-14'),
        amount: 77081.5,
        status: FinancialStatus.OPEN,
      },
    ],
  });

  await prisma.cashflowForecast.createMany({
    data: [
      {
        scenario: ForecastScenario.CONSERVATIVE,
        referenceDate: new Date('2026-04-01'),
        projectedIn: 180000,
        projectedOut: 140000,
        projectedNet: 40000,
        notes: 'Cenário conservador inicial.',
      },
      {
        scenario: ForecastScenario.PROBABLE,
        referenceDate: new Date('2026-04-01'),
        projectedIn: 230000,
        projectedOut: 150000,
        projectedNet: 80000,
        notes: 'Cenário provável inicial.',
      },
    ],
  });

  await prisma.importBatch.create({
    data: {
      sourceFileName: '29.01.2026 CONTROLE FINANCEIRO.xlsx',
      sourceFileHash: 'seed-file-hash',
      versionTag: 'seed-v1',
      status: 'COMPLETED',
      importedCount: 1,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
