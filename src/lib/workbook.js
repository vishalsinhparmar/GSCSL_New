import * as XLSX from 'xlsx';
import { addEndTripFlag, findMissingColumns } from './calculations.js';

// Reads a raw export (.xlsx / .xls / .csv). Uses the "RAW" sheet when present, otherwise the first sheet.
export async function readRawFile(file) {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false });
  const sheetName = workbook.SheetNames.find((name) => name.trim().toUpperCase() === 'RAW') ?? workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  if (rows.length === 0) throw new Error(`Sheet "${sheetName}" has no data rows.`);
  const missing = findMissingColumns(rows);
  if (missing.length) throw new Error(`Missing required column(s): ${missing.join(', ')}`);

  return { sheetName, rows: addEndTripFlag(rows) };
}
