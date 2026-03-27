import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middlewares/auth.js';
import { login } from '../services/auth.service.js';
import { getCatalogOptions } from '../services/catalog.service.js';
import { getExecutiveDashboard } from '../services/dashboard.service.js';
import { getLaunchById, listLaunches } from '../services/launches.service.js';
import { getCashflowForecast, getDreReport } from '../services/reports.service.js';
import { prisma } from '../lib/prisma.js';
import { importWorkbook } from '../import/excel-import.js';
import { config } from '../config.js';
import { getPayablesOverview, getReceivableVsPayableReport, getReceivablesOverview } from '../services/finance.service.js';
import {
  getWorkbookAccountingReport,
  getWorkbookBalanceAccounts,
  getWorkbookBillingVsExpenses,
  getWorkbookCashflowPlan,
  getWorkbookDre,
  getWorkbookGeneralReport,
  getWorkbookReceivedPaidSummary,
  getWorkbookSalesCommissions,
} from '../services/workbook-reports.service.js';
import {
  createAccountCategory,
  createChartOfAccount,
  createClient,
  createPaymentMethod,
  createVendor,
  getMasterDataOverview,
  listAccountCategories,
  listChartOfAccounts,
  listClients,
  listPaymentMethods,
  listVendors,
  updateAccountCategory,
  updateChartOfAccount,
  updateClient,
  updatePaymentMethod,
  updateVendor,
} from '../services/master-data.service.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.post('/auth/login', async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
  const result = await login(body.email, body.password);
  if (!result) return res.status(401).json({ message: 'Credenciais invalidas.' });
  return res.json(result);
});

router.use(requireAuth);

router.get('/catalog/options', async (_req, res) => res.json(await getCatalogOptions()));

router.get('/dashboard/executive', async (req, res) =>
  res.json(
    await getExecutiveDashboard({
      companyCode: req.query.companyCode as string | undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      month: req.query.month ? Number(req.query.month) : undefined,
    }),
  ));

router.get('/financial-launches', async (req, res) => res.json(await listLaunches(req.query as Record<string, string | undefined>)));

router.get('/financial-launches/:id', async (req, res) => {
  const item = await getLaunchById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Lancamento nao encontrado.' });
  return res.json(item);
});

router.get('/reports/dre', async (req, res) =>
  res.json(
    await getDreReport({
      year: req.query.year ? Number(req.query.year) : undefined,
      month: req.query.month ? Number(req.query.month) : undefined,
      companyCode: req.query.companyCode as string | undefined,
    }),
  ));

router.get('/reports/cashflow-forecast', async (_req, res) => res.json(await getCashflowForecast()));
router.get('/reports/receivables', async (req, res) =>
  res.json(
    await getReceivablesOverview({
      companyCode: req.query.companyCode as string | undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      month: req.query.month ? Number(req.query.month) : undefined,
      status: req.query.status as string | undefined,
    }),
  ));
router.get('/reports/payables', async (req, res) =>
  res.json(
    await getPayablesOverview({
      companyCode: req.query.companyCode as string | undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      month: req.query.month ? Number(req.query.month) : undefined,
      status: req.query.status as string | undefined,
    }),
  ));
router.get('/reports/receivable-vs-payable', async (req, res) =>
  res.json(
    await getReceivableVsPayableReport({
      companyCode: req.query.companyCode as string | undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      month: req.query.month ? Number(req.query.month) : undefined,
    }),
  ));
router.get('/reports/dre-workbook', async (_req, res) => res.json(getWorkbookDre()));
router.get('/reports/balance-accounts', async (_req, res) => res.json(getWorkbookBalanceAccounts()));
router.get('/reports/cashflow-plan', async (_req, res) => res.json(getWorkbookCashflowPlan()));
router.get('/reports/sales-commissions', async (_req, res) => res.json(getWorkbookSalesCommissions()));
router.get('/reports/accounting-report', async (_req, res) => res.json(getWorkbookAccountingReport()));
router.get('/reports/billing-vs-expenses', async (_req, res) => res.json(getWorkbookBillingVsExpenses()));
router.get('/reports/general-workbook', async (_req, res) => res.json(getWorkbookGeneralReport()));
router.get('/reports/received-paid-summary', async (_req, res) => res.json(getWorkbookReceivedPaidSummary()));
router.get('/master-data/overview', async (req, res) =>
  res.json(await getMasterDataOverview({ companyCode: req.query.companyCode as string | undefined })),
);
router.get('/master-data/clients', async (req, res) =>
  res.json(await listClients({ companyCode: req.query.companyCode as string | undefined })),
);
router.post('/master-data/clients', async (req, res) => {
  const body = z
    .object({
      companyCode: z.string().min(1),
      code: z.string().min(1),
      name: z.string().min(1),
      legalName: z.string().optional().nullable(),
      document: z.string().optional().nullable(),
    })
    .parse(req.body);

  return res.json(await createClient(body));
});
router.put('/master-data/clients/:id', async (req, res) => {
  const body = z
    .object({
      companyCode: z.string().min(1),
      code: z.string().min(1),
      name: z.string().min(1),
      legalName: z.string().optional().nullable(),
      document: z.string().optional().nullable(),
    })
    .parse(req.body);

  return res.json(await updateClient(req.params.id, body));
});
router.get('/master-data/vendors', async (req, res) =>
  res.json(await listVendors({ companyCode: req.query.companyCode as string | undefined })),
);
router.post('/master-data/vendors', async (req, res) => {
  const body = z
    .object({
      companyCode: z.string().min(1),
      code: z.string().min(1),
      name: z.string().min(1),
    })
    .parse(req.body);

  return res.json(await createVendor(body));
});
router.put('/master-data/vendors/:id', async (req, res) => {
  const body = z
    .object({
      companyCode: z.string().min(1),
      code: z.string().min(1),
      name: z.string().min(1),
    })
    .parse(req.body);

  return res.json(await updateVendor(req.params.id, body));
});
router.get('/master-data/account-categories', async (req, res) =>
  res.json(await listAccountCategories({ companyCode: req.query.companyCode as string | undefined })),
);
router.post('/master-data/account-categories', async (req, res) => {
  const body = z
    .object({
      companyCode: z.string().min(1),
      name: z.string().min(1),
      dreGroup: z.string().optional().nullable(),
    })
    .parse(req.body);

  return res.json(await createAccountCategory(body));
});
router.put('/master-data/account-categories/:id', async (req, res) => {
  const body = z
    .object({
      companyCode: z.string().min(1),
      name: z.string().min(1),
      dreGroup: z.string().optional().nullable(),
    })
    .parse(req.body);

  return res.json(await updateAccountCategory(req.params.id, body));
});
router.get('/master-data/chart-of-accounts', async (req, res) =>
  res.json(await listChartOfAccounts({ companyCode: req.query.companyCode as string | undefined })),
);
router.post('/master-data/chart-of-accounts', async (req, res) => {
  const body = z
    .object({
      companyCode: z.string().min(1),
      code: z.string().min(1),
      description: z.string().min(1),
      groupName: z.string().min(1),
      fixedOrVariable: z.string().optional().nullable(),
      categoryId: z.string().optional().nullable(),
    })
    .parse(req.body);

  return res.json(await createChartOfAccount(body));
});
router.put('/master-data/chart-of-accounts/:id', async (req, res) => {
  const body = z
    .object({
      companyCode: z.string().min(1),
      code: z.string().min(1),
      description: z.string().min(1),
      groupName: z.string().min(1),
      fixedOrVariable: z.string().optional().nullable(),
      categoryId: z.string().optional().nullable(),
    })
    .parse(req.body);

  return res.json(await updateChartOfAccount(req.params.id, body));
});
router.get('/master-data/payment-methods', async (req, res) =>
  res.json(await listPaymentMethods({ companyCode: req.query.companyCode as string | undefined })),
);
router.post('/master-data/payment-methods', async (req, res) => {
  const body = z
    .object({
      companyCode: z.string().min(1),
      code: z.string().min(1),
      name: z.string().min(1),
    })
    .parse(req.body);

  return res.json(await createPaymentMethod(body));
});
router.put('/master-data/payment-methods/:id', async (req, res) => {
  const body = z
    .object({
      companyCode: z.string().min(1),
      code: z.string().min(1),
      name: z.string().min(1),
    })
    .parse(req.body);

  return res.json(await updatePaymentMethod(req.params.id, body));
});
router.get('/imports', async (_req, res) => res.json(await prisma.importBatch.findMany({ orderBy: { createdAt: 'desc' } })));

router.post('/imports/run-local', async (req, res) => {
  const body = z
    .object({
      filePath: z.string().optional(),
      replaceExisting: z.boolean().optional(),
    })
    .parse(req.body ?? {});

  const result = await importWorkbook({
    filePath: body.filePath ?? config.defaultWorkbookPath,
    replaceExisting: body.replaceExisting ?? config.defaultReplaceExisting,
  });

  return res.json(result);
});

router.post('/imports/reprocess/:batchId', async (req, res) => res.json({ message: 'Reprocessamento agendado.', batchId: req.params.batchId }));
router.post('/imports/rollback/:batchId', async (req, res) => res.json({ message: 'Rollback solicitado.', batchId: req.params.batchId }));

router.get('/filters/options', async (_req, res) => {
  const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } });
  const years = await prisma.financialLaunch.findMany({
    distinct: ['businessYear'],
    select: { businessYear: true },
    orderBy: { businessYear: 'desc' },
  });

  res.json({
    companies,
    years: years.map((item) => item.businessYear),
    months: [
      { value: 1, label: 'Janeiro' },
      { value: 2, label: 'Fevereiro' },
      { value: 3, label: 'Marco' },
      { value: 4, label: 'Abril' },
      { value: 5, label: 'Maio' },
      { value: 6, label: 'Junho' },
      { value: 7, label: 'Julho' },
      { value: 8, label: 'Agosto' },
      { value: 9, label: 'Setembro' },
      { value: 10, label: 'Outubro' },
      { value: 11, label: 'Novembro' },
      { value: 12, label: 'Dezembro' },
    ],
    statuses: ['OPEN', 'OVERDUE', 'PARTIAL', 'SETTLED'],
  });
});

export default router;
