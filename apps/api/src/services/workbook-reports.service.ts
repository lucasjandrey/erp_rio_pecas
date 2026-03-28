import xlsx from 'xlsx';
import { config } from '../config.js';

function readWorkbook() {
  return xlsx.readFile(config.defaultWorkbookPath, { cellDates: true, raw: true });
}

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function getSheetRows(sheetName: string) {
  const workbook = readWorkbook();
  const exact = workbook.SheetNames.find((name) => name === sheetName);
  const fallback = workbook.SheetNames.find((name) => normalizeText(name) === normalizeText(sheetName));
  const sheet = workbook.Sheets[exact ?? fallback ?? sheetName];
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
  return xlsx.utils.sheet_to_json<(string | number | Date | null)[]>(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });
}

function formatMonthLabel(value: unknown) {
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
  }
  return String(value ?? '');
}

export function getWorkbookDre() {
  const rows = getSheetRows('DRE Financeiro');
  const months = rows[0].slice(3).map(formatMonthLabel).filter(Boolean);

  const entries = rows
    .slice(1)
    .filter((row) => row[0])
    .map((row) => {
      const label = String(row[0]);
      const total = Number(row[1] ?? 0);
      const percentage = Number(row[2] ?? 0);
      const monthlyValues = row.slice(3, 3 + months.length).map((value) => Number(value ?? 0));

      let kind: 'section' | 'detail' | 'total' = 'detail';
      if (label.startsWith('( = )')) kind = 'total';
      else if (row[1] == null && row[2] == null) kind = 'section';

      return {
        label,
        total,
        percentage,
        kind,
        months: months.map((month, index) => ({
          month,
          value: monthlyValues[index] ?? 0,
        })),
      };
    });

  return { months, entries };
}

export function getWorkbookBalanceAccounts() {
  const rows = getSheetRows('SALDO CONTAS');
  const headers = rows[0].map((value) => String(value ?? ''));

  const items = rows.slice(1).filter((row) => row[0]).map((row) => ({
    date: row[0],
    investimentosRio: Number(row[1] ?? 0),
    investimentoMc: Number(row[2] ?? 0),
    saldoRioInter: Number(row[3] ?? 0),
    saldoMc: Number(row[4] ?? 0),
    cotasCapitais: Number(row[5] ?? 0),
    saldo: Number(row[6] ?? 0),
    aPagar: Number(row[14] ?? 0),
    aReceber: Number(row[15] ?? 0),
    aReceberAdvogado: Number(row[16] ?? 0),
  }));

  return { headers, items };
}

export function getWorkbookCashflowPlan() {
  const rows = getSheetRows('Previsão Caixa');
  const fixedCosts = rows
    .slice(0, 11)
    .filter((row) => row[0])
    .map((row) => ({
      label: String(row[0]),
      value: Number(row[1] ?? 0),
    }));

  const monthsHeader = rows[16]?.slice(1).filter((value) => value != null).map((value) => String(value)) ?? [];
  const monthlyRows = rows
    .slice(17)
    .filter((row) => row[0])
    .map((row) => ({
      label: String(row[0]),
      values: row.slice(1, 1 + monthsHeader.length).map((value) => Number(value ?? 0)),
    }));

  return {
    fixedCosts,
    months: monthsHeader,
    monthlyRows,
  };
}

export function getWorkbookSalesCommissions() {
  const rows = getSheetRows('Vendas e Comissões');
  const machineRows = rows
    .slice(6)
    .filter((row) => typeof row[0] === 'number')
    .map((row) => ({
      month: Number(row[0] ?? 0),
      sales2025New: Number(row[1] ?? 0),
      sales2025Used: Number(row[2] ?? 0),
      sales2026New: Number(row[3] ?? 0),
      sales2026Used: Number(row[4] ?? 0),
    }));

  const totals = machineRows.reduce(
    (acc, row) => {
      acc.sales2025New += row.sales2025New;
      acc.sales2025Used += row.sales2025Used;
      acc.sales2026New += row.sales2026New;
      acc.sales2026Used += row.sales2026Used;
      return acc;
    },
    { sales2025New: 0, sales2025Used: 0, sales2026New: 0, sales2026Used: 0 },
  );

  return { machineRows, totals };
}

export function getWorkbookAccountingReport() {
  const rows = getSheetRows('Relatório Conta Contábil');
  const monthHeaders = rows[3]?.slice(1, 13).map((value) => String(value ?? '')) ?? [];
  const entries = rows
    .slice(4)
    .filter((row) => row[0] && typeof row[0] === 'string')
    .map((row) => ({
      account: String(row[0]),
      monthlyValues: monthHeaders.map((month, index) => ({
        month,
        value: Number(row[index + 1] ?? 0),
      })),
      total: Number(row[13] ?? 0),
    }));

  return { months: monthHeaders, entries };
}

export function getWorkbookBillingVsExpenses() {
  const rows = getSheetRows('FATURAMENTO x GASTOS');
  const entries = rows
    .slice(2)
    .filter((row) => typeof row[6] === 'number')
    .map((row) => ({
      month: Number(row[6] ?? 0),
      revenue2018: Number(row[7] ?? 0),
      revenue2020: Number(row[8] ?? 0),
      revenue2021: Number(row[9] ?? 0),
      revenue2022: Number(row[10] ?? 0),
      revenue2023: Number(row[11] ?? 0),
      revenue2024: Number(row[12] ?? 0),
      revenue2025: Number(row[13] ?? 0),
      revenue2026: Number(row[14] ?? 0),
      result2025: Number(row[23] ?? 0),
      result2026: Number(row[24] ?? 0),
    }));

  return { entries };
}

export function getWorkbookGeneralReport() {
  const rows = getSheetRows('RELATÓRIO');
  const year = Number(rows[0]?.[0] ?? 0);
  const headers = rows[0]?.slice(1).map((value) => String(value ?? '')) ?? [];
  const items = rows
    .slice(1)
    .filter((row) => row[0])
    .map((row) => {
      const result: Record<string, string | number> = { month: String(row[0]) };
      headers.forEach((header, index) => {
        result[header] = Number(row[index + 1] ?? 0);
      });
      return result;
    });

  return { year, headers, items };
}

export function getWorkbookReceivedPaidSummary() {
  const receivableRows = getSheetRows('A receber Geral');
  const payableRows = getSheetRows('pago e a pagar');

  const receivablesByAccount = receivableRows
    .slice(4)
    .filter((row) => typeof row[0] === 'string' && typeof row[1] === 'number')
    .slice(0, 12)
    .map((row) => ({
      label: String(row[0]),
      total: Number(row[1] ?? 0),
      percentage: Number(row[2] ?? 0),
    }));

  const payablesSummary = payableRows
    .slice(6)
    .filter((row) => row[17] && typeof row[18] === 'number')
    .slice(0, 12)
    .map((row) => ({
      supplier: String(row[17]),
      total: Number(row[18] ?? 0),
    }));

  return { receivablesByAccount, payablesSummary };
}
