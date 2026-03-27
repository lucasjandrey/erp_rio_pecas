import 'dotenv/config';
import { importWorkbook } from '../import/excel-import.js';
import { config } from '../config.js';

function getArg(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function getPositionalFilePath() {
  return process.argv.slice(2).find((arg) => !arg.startsWith('--'));
}

async function main() {
  const filePath = getArg('--file') ?? getPositionalFilePath() ?? config.defaultWorkbookPath;
  const replaceExisting = process.argv.includes('--replace') || process.env.REPLACE_EXISTING === '1' || config.defaultReplaceExisting;

  const result = await importWorkbook({
    filePath,
    replaceExisting,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
