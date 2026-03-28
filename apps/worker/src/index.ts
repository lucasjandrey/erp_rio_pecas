import 'dotenv/config';
import chokidar from 'chokidar';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import xlsx from 'xlsx';
import { z } from 'zod';

const projectRoot = process.cwd();
const importDir = process.env.WORKER_IMPORT_DIR?.trim() || path.resolve(projectRoot, 'data', 'imports');
const processedDir = process.env.WORKER_PROCESSED_DIR?.trim() || path.resolve(projectRoot, 'data', 'processed');
const requiredSheets =
  process.env.WORKER_REQUIRED_SHEETS?.split('|').map((item) => item.trim()).filter(Boolean) || [
    'Base Dados',
    'lançamentos',
    'Receber X Pagar',
    'DRE Financeiro',
    'Previsão Caixa',
  ];

const rowSchema = z.object({
  Data: z.any().optional(),
  CE: z.any().optional(),
  Empresa: z.any().optional(),
  CC: z.any().optional(),
  'Descrição Cliente': z.any().optional(),
  'R$ Receita': z.any().optional(),
  'R$ Despesas': z.any().optional(),
});

function hashFile(filePath: string) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function summarizeWorkbook(filePath: string) {
  const workbook = xlsx.readFile(filePath, { cellFormula: true, cellDates: true });
  const missingSheets = requiredSheets.filter((sheet) => !workbook.SheetNames.includes(sheet));
  if (missingSheets.length > 0) throw new Error(`Abas obrigatórias ausentes: ${missingSheets.join(', ')}`);

  const launches = xlsx.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets['lançamentos'], { defval: null });
  const invalidRows = launches
    .map((row, index) => ({ row: index + 2, result: rowSchema.safeParse(row) }))
    .filter((item) => !item.result.success)
    .map((item) => ({ row: item.row, errors: item.result.success ? [] : item.result.error.issues.map((issue) => issue.message) }));

  return {
    fileName: path.basename(filePath),
    fileHash: hashFile(filePath),
    sheets: workbook.SheetNames,
    totalLaunchRows: launches.length,
    invalidRows,
    importedPreview: launches.slice(0, 5),
  };
}

function persistSummary(summary: ReturnType<typeof summarizeWorkbook>) {
  fs.mkdirSync(processedDir, { recursive: true });
  const target = path.join(processedDir, `${summary.fileName}.summary.json`);
  fs.writeFileSync(target, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`Resumo salvo em ${target}`);
}

function runPersistentImport(filePath: string) {
  const child = spawn('npm', ['--workspace', 'apps/api', 'run', 'import:excel', '--', '--file', filePath], {
    cwd: projectRoot,
    shell: true,
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    console.log(`Importação persistente finalizada com código ${code}`);
  });
}

function processFile(filePath: string) {
  if (!filePath.endsWith('.xlsx')) return;
  try {
    console.log(`Processando ${filePath}`);
    const summary = summarizeWorkbook(filePath);
    persistSummary(summary);
    runPersistentImport(filePath);
  } catch (error) {
    console.error(`Falha ao processar ${filePath}`, error);
  }
}

console.log(`Monitorando pasta ${importDir}`);
chokidar.watch(importDir, { ignoreInitial: false }).on('add', processFile).on('change', processFile);
