import { REQUIRED_COLUMNS } from './reportConfig.js';

export const END_TRIP_FLAG = 'End Trip Flag';

// Excel-style text normalisation: blanks become '' and surrounding spaces are removed
// (exports often carry trailing spaces, e.g. "SHREE ENTERPRISE ").
export const clean = (value) => (value == null ? '' : String(value).trim());

// Reproduces the workbook formula per row:
//   =IF(AND(CK2<>"", COUNTIFS($H$2:H2, H2, $CK$2:CK2, "<>")=1), 1, 0)
// i.e. 1 only for the first row (in sheet order) of each LR Number that has a trip_end_datetime.
export function addEndTripFlag(rows) {
  const seen = new Set();
  for (const row of rows) {
    const hasEnd = clean(row.trip_end_datetime) !== '';
    const lr = clean(row['LR Number']).toLowerCase();
    row[END_TRIP_FLAG] = hasEnd && !seen.has(lr) ? 1 : 0;
    if (hasEnd) seen.add(lr);
  }
  return rows;
}

export function findMissingColumns(rows) {
  const headers = new Set(Object.keys(rows[0] ?? {}));
  return REQUIRED_COLUMNS.filter((column) => !headers.has(column));
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ordinal = (day) => {
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
  return `${day}${['th', 'st', 'nd', 'rd'][day % 10] ?? 'th'}`;
};

// "2026-10-21" -> "21st October'26"
export function formatReportDate(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate ?? '');
  if (!match) return '';
  const [, year, month, day] = match;
  return `${ordinal(Number(day))} ${MONTHS[Number(month) - 1]}'${year.slice(2)}`;
}

// Latest 'DC Creation Date' in the data drives the report date in the title.
export function latestDate(rows, column = 'DC Creation Date') {
  return rows.map((row) => clean(row[column])).filter(Boolean).sort().at(-1) ?? '';
}

export function buildReportTitle(rows, timeWindow) {
  const date = formatReportDate(latestDate(rows));
  return `Last Mile Report of Till ${date || '____'} ( ${timeWindow})`;
}
