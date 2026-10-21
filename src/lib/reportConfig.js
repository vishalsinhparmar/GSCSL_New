// Declarative definition of the Last Mile report.
// Each measure mirrors a Power Pivot / pivot-table measure from the Excel workbook.
export const DIMENSIONS = [
  { key: 'District', label: 'District' },
  { key: 'GSCSCL Godown', label: 'GSCSCL Godown' },
  { key: 'Transporter Name', label: 'Transporter Name' },
];

export const MEASURES = [
  // CALCULATE(DISTINCTCOUNT('Range 1'[LR Number]), FILTER(..., LEN(TRIM(LR & "")) > 0))
  { key: 'tripCreated', label: 'Trip Created', aggregate: 'distinctCount', field: 'LR Number' },
  // Count of Reference Number
  { key: 'dcNumber', label: 'DC Number', aggregate: 'countNonBlank', field: 'Reference Number' },
  // Count of EPOD Status (delivered rows only; blanks are not counted)
  { key: 'epod', label: 'EPOD', aggregate: 'countNonBlank', field: 'EPOD Status' },
  // Sum of the End Trip flag column
  { key: 'endTrip', label: 'End Trip', aggregate: 'sum', field: 'End Trip Flag' },
];

export const REQUIRED_COLUMNS = [
  'Reference Number',
  'District',
  'GSCSCL Godown',
  'Transporter Name',
  'LR Number',
  'EPOD Status',
  'trip_end_datetime',
  'DC Creation Date',
];

export const DEFAULT_TIME_WINDOW = '00:00-18:00';
