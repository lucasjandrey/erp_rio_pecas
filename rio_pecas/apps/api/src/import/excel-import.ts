import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import xlsx from 'xlsx';
import { ImportBatchStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { calculateDelayDays, calculateDueDate, deriveStatus, isCriticalLate, normalizeMachineCondition } from '../domain/financial-rules.js';

const BASE_SHEET = 'Base Dados';
const LAUNCHES_SHEET = 'lançamentos';

type ImportOptions = {
  filePath: string;
  replaceExisting?: boolean;
};

type LaunchRow = Record<string, unknown>;

function hashFile(filePath: string) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function workbookFrom(filePath: string) {
  return xlsx.readFile(filePath, {
    cellDates: true,
    raw: false,
    dense: false,
  });
}

function normalizeCode(value: unknown): string | null {
  if (value == null || value === '') return null;
  return String(value).trim();
}

function normalizeText(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function normalizeNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const sanitized = String(value).replace(/\./g, '').replace(',', '.').trim();
  const numeric = Number(sanitized);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeInteger(value: unknown): number | null {
  const numeric = normalizeNumber(value);
  return numeric == null ? null : Math.trunc(numeric);
}

function normalizeDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const parsed = xlsx.SSF.parse_date_code(value);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, parsed.S);
  }
  const text = String(value).trim();
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getArraySheet(workbook: xlsx.WorkBook, sheetName: string) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Aba obrigatória ausente: ${sheetName}`);
  return xlsx.utils.sheet_to_json<(string | number | Date | null)[]>(sheet, {
    header: 1,
    defval: null,
    raw: false,
  });
}

function getObjectSheet(workbook: xlsx.WorkBook, sheetName: string) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Aba obrigatória ausente: ${sheetName}`);
  return xlsx.utils.sheet_to_json<LaunchRow>(sheet, {
    defval: null,
    raw: true,
  });
}

function cleanLaunchRow(row: LaunchRow): LaunchRow {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.trim(), value]),
  );
}

async function upsertBaseDimensions(workbook: xlsx.WorkBook) {
  const rows = getArraySheet(workbook, BASE_SHEET).slice(1);

  for (const row of rows) {
    const accountCode = normalizeCode(row[0]);
    const accountGroup = normalizeText(row[1]);
    const fixedOrVariable = normalizeText(row[2]);
    const accountDescription = normalizeText(row[3]);
    const paymentCode = normalizeCode(row[6]);
    const paymentName = normalizeText(row[7]);
    const companyCode = normalizeCode(row[9]);
    const companyName = normalizeText(row[10]);
    const companyShort = normalizeText(row[11]);
    const clientCode = normalizeCode(row[13]);
    const clientName = normalizeText(row[14]);
    const clientLegalName = normalizeText(row[15]);
    const clientDocument = normalizeText(row[17]);
    const company =
      companyCode && companyName && companyShort
        ? await prisma.company.upsert({
            where: { code: companyCode },
            update: { name: companyName, shortName: companyShort },
            create: { code: companyCode, name: companyName, shortName: companyShort },
          })
        : null;

    if (accountGroup) {
      await prisma.accountCategory.upsert({
        where: { name: accountGroup },
        update: { dreGroup: accountGroup, companyId: company?.id ?? undefined },
        create: { name: accountGroup, dreGroup: accountGroup, companyId: company?.id ?? undefined },
      });
    }

    if (accountCode && accountGroup && accountDescription) {
      const category = await prisma.accountCategory.findUnique({ where: { name: accountGroup } });
      await prisma.chartOfAccount.upsert({
        where: { code: accountCode },
        update: {
          groupName: accountGroup,
          fixedOrVariable,
          description: accountDescription,
          categoryId: category?.id,
          companyId: company?.id ?? undefined,
        },
        create: {
          code: accountCode,
          groupName: accountGroup,
          fixedOrVariable,
          description: accountDescription,
          categoryId: category?.id,
          companyId: company?.id ?? undefined,
        },
      });
    }

    if (paymentCode && paymentName) {
      await prisma.paymentMethod.upsert({
        where: { code: paymentCode },
        update: { name: paymentName, companyId: company?.id ?? undefined },
        create: { code: paymentCode, name: paymentName, companyId: company?.id ?? undefined },
      });
    }

    if (clientCode && clientName) {
      await prisma.client.upsert({
        where: { code: clientCode },
        update: {
          name: clientName,
          legalName: clientLegalName,
          document: clientDocument,
          companyId: company?.id ?? undefined,
        },
        create: {
          code: clientCode,
          name: clientName,
          legalName: clientLegalName,
          document: clientDocument,
          companyId: company?.id ?? undefined,
        },
      });
    }
  }
}

function buildFingerprint(row: LaunchRow) {
  return [
    normalizeCode(row['CE']),
    normalizeCode(row['CC']),
    normalizeCode(row['Cco']),
    normalizeText(row['Descrição Cliente']),
    normalizeNumber(row['R$ Receita']) ?? 0,
    normalizeNumber(row['R$ Despesas']) ?? 0,
    normalizeInteger(row['Venc (dias)']) ?? 0,
    normalizeDate(row['Data'])?.toISOString().slice(0, 10) ?? '',
  ].join('|');
}

async function importLaunches(workbook: xlsx.WorkBook, batchId: string, replaceExisting = false) {
  const rows = getObjectSheet(workbook, LAUNCHES_SHEET).map(cleanLaunchRow);
  const existingCompanies = await prisma.company.findMany();
  const existingClients = await prisma.client.findMany();
  const existingAccounts = await prisma.chartOfAccount.findMany();
  const existingMethods = await prisma.paymentMethod.findMany();
  const companyByCode = new Map(existingCompanies.map((item) => [item.code, item]));
  const clientByCode = new Map(existingClients.map((item) => [item.code, item]));
  const accountByCode = new Map(existingAccounts.map((item) => [item.code, item]));
  const paymentByCode = new Map(existingMethods.map((item) => [item.code, item]));

  if (replaceExisting) {
    await prisma.financialInstallment.deleteMany();
    await prisma.financialLaunch.deleteMany();
    await prisma.importBatch.deleteMany({
      where: {
        id: {
          not: batchId,
        },
      },
    });
  }

  const seenFingerprints = new Set<string>();
  const persistedLaunches = await prisma.financialLaunch.findMany({
    include: {
      company: true,
      client: true,
      account: true,
    },
  });

  const persistedFingerprints = new Set(
    persistedLaunches.map((item) =>
      [
        item.company.code,
        item.client?.code ?? '',
        item.account?.code ?? '',
        item.description ?? '',
        Number(item.revenueAmount ?? 0),
        Number(item.expenseAmount ?? 0),
        item.dueDays ?? 0,
        item.launchDate.toISOString().slice(0, 10),
      ].join('|'),
    ),
  );

  let importedCount = 0;
  let duplicatesCount = 0;
  let invalidCount = 0;

  for (const row of rows) {
    const launchDate = normalizeDate(row['Data']);
    const companyCode = normalizeCode(row['CE']);
    const clientCode = normalizeCode(row['CC']);
    const accountCode = normalizeCode(row['Cco']);
    const paymentCode = normalizeCode(row['CP']);
    const vendorCode = normalizeCode(row['Cód. Vendedor']);
    const vendorName = normalizeText(row['Nome do Vendedor']);
    const revenueAmount = normalizeNumber(row['R$ Receita']) ?? 0;
    const expenseAmount = normalizeNumber(row['R$ Despesas']) ?? 0;
    const dueDays = normalizeInteger(row['Venc (dias)']);
    const explicitDueDate = normalizeDate(row['Venc (data)']);
    const settlementCell = row['Data Pago/Recebido'];
    const settlementDate = settlementCell instanceof Date ? settlementCell : normalizeDate(settlementCell);
    const statusText = normalizeText(settlementCell)?.toLowerCase();
    const totalSettledAmount = normalizeNumber(row['R$ Total Recebido']) ?? 0;
    const businessYear = normalizeInteger(row['Ano Negócio']);
    const businessMonth = normalizeInteger(row['Mês Negócio']);
    const dueYear = normalizeInteger(row['Ano Vencimento']);
    const dueMonth = normalizeInteger(row['Mês Vencimento']);
    const description = normalizeText(row['Descrição da Conta']) ?? normalizeText(row['Descrição Geral']);
    const observations = normalizeText(row['Observações']);

    if (!launchDate || !companyCode || (!revenueAmount && !expenseAmount)) {
      invalidCount += 1;
      continue;
    }

    const company = companyByCode.get(companyCode);
    if (!company) {
      invalidCount += 1;
      continue;
    }

    let vendorId: string | null = null;
    if (vendorCode && vendorName) {
      const vendor = await prisma.vendor.upsert({
        where: { code: vendorCode },
        update: { name: vendorName, companyId: company.id },
        create: { code: vendorCode, name: vendorName, companyId: company.id },
      });
      vendorId = vendor.id;
    }

    const fingerprint = buildFingerprint(row);
    const duplicateInFile = seenFingerprints.has(fingerprint);
    const duplicateInDb = persistedFingerprints.has(fingerprint);
    seenFingerprints.add(fingerprint);

    const dueDate = calculateDueDate({
      launchDate,
      dueDate: explicitDueDate,
      dueDays,
    });

    const statusFromRules = deriveStatus({
      launchDate,
      dueDate,
      dueDays,
      settlementDate,
      revenueAmount,
      expenseAmount,
      totalSettledAmount,
    });

    const effectiveStatus =
      statusText && ['pago', 'recebido', 'ok'].includes(statusText)
        ? 'SETTLED'
        : statusFromRules;

    const delayDays = calculateDelayDays({
      launchDate,
      dueDate,
      dueDays,
      settlementDate: effectiveStatus === 'SETTLED' ? new Date() : settlementDate,
    });

    const criticalLate = isCriticalLate({
      launchDate,
      dueDate,
      dueDays,
      settlementDate,
      today: new Date(),
    });

    if (duplicateInFile || duplicateInDb) {
      duplicatesCount += 1;
      continue;
    }

    const launch = await prisma.financialLaunch.create({
      data: {
        importBatchId: batchId,
        launchDate,
        companyId: company.id,
        clientId: clientCode ? clientByCode.get(clientCode)?.id : null,
        accountId: accountCode ? accountByCode.get(accountCode)?.id : null,
        vendorId,
        paymentMethodId: paymentCode ? paymentByCode.get(paymentCode)?.id : null,
        description,
        revenueAmount: new Prisma.Decimal(revenueAmount),
        expenseAmount: new Prisma.Decimal(expenseAmount),
        machinesQuantity: normalizeInteger(row['QTD Máquinas']),
        machineCondition: normalizeMachineCondition(normalizeText(row['N ou U'])) ?? undefined,
        dueDays,
        dueDate,
        settlementDate,
        totalSettledAmount: new Prisma.Decimal(totalSettledAmount),
        financialStatus: effectiveStatus,
        delayDays,
        isDuplicate: duplicateInFile,
        isCriticalLate: criticalLate,
        businessYear: businessYear ?? launchDate.getFullYear(),
        businessMonth: businessMonth ?? launchDate.getMonth() + 1,
        dueYear: dueYear ?? dueDate?.getFullYear() ?? null,
        dueMonth: dueMonth ?? (dueDate ? dueDate.getMonth() + 1 : null),
      },
    });

    const installmentAmount = Math.max(revenueAmount, expenseAmount);
    if (installmentAmount > 0) {
      await prisma.financialInstallment.create({
        data: {
          launchId: launch.id,
          installmentNo: 1,
          dueDate,
          amount: new Prisma.Decimal(installmentAmount),
          settledAmount: totalSettledAmount > 0 ? new Prisma.Decimal(totalSettledAmount) : null,
          settlementDate,
          status: effectiveStatus,
        },
      });
    }

    importedCount += 1;
  }

  await prisma.importBatch.update({
    where: { id: batchId },
    data: {
      status: ImportBatchStatus.COMPLETED,
      importedCount,
      duplicatesCount,
      invalidCount,
    },
  });

  return {
    importedCount,
    duplicatesCount,
    invalidCount,
  };
}

export async function importWorkbook(options: ImportOptions) {
  const filePath = path.resolve(options.filePath);
  const workbook = workbookFrom(filePath);
  const batch = await prisma.importBatch.create({
    data: {
      sourceFileName: path.basename(filePath),
      sourceFileHash: hashFile(filePath),
      versionTag: `xlsx-${new Date().toISOString()}`,
      status: ImportBatchStatus.PROCESSING,
    },
  });

  try {
    await upsertBaseDimensions(workbook);
    const result = await importLaunches(workbook, batch.id, options.replaceExisting);
    return {
      batchId: batch.id,
      ...result,
    };
  } catch (error) {
    await prisma.importBatch.update({
      where: { id: batch.id },
      data: {
        status: ImportBatchStatus.FAILED,
      },
    });
    throw error;
  }
}
