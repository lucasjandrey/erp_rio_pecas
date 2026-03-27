import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const serviceDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(serviceDir, '..', '..', '..');

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Environment variable ${name} is required.`);
  }

  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3333),
  jwtSecret: requiredEnv('JWT_SECRET'),
  defaultWorkbookPath:
    process.env.IMPORT_DEFAULT_WORKBOOK_PATH?.trim() ||
    path.resolve(projectRoot, 'data', 'imports', '29.01.2026 CONTROLE FINANCEIRO.xlsx'),
  defaultReplaceExisting: process.env.IMPORT_DEFAULT_REPLACE_EXISTING === '1',
};
