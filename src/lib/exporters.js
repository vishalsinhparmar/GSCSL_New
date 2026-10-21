import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toReportTable } from './reportTable.js';

export const toFileName = (title, extension) =>
  `${title.replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '')}.${extension}`;

export function buildWorkbook(report, title) {
  const { head, body, dimensionCount } = toReportTable(report);
  const sheet = XLSX.utils.aoa_to_sheet([[title], head, ...body]);
  sheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: head.length - 1 } }];
  sheet['!cols'] = head.map((_, index) => ({ wch: index < dimensionCount ? 26 : 14 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Summary');
  return workbook;
}

export function exportExcel(report, title) {
  XLSX.writeFile(buildWorkbook(report, title), toFileName(title, 'xlsx'));
}

const COLORS = {
  header: [31, 78, 120],
  subtotal: [221, 235, 247],
  grand: [189, 215, 238],
};

// A4 portrait usable width is 190mm (210mm - 2 x 10mm margins).
const COLUMN_WIDTHS = { dimensions: [36, 30, 54], measure: 18 };

export function buildPdf(report, title) {
  const { head, body, kinds, dimensionCount } = toReportTable(report);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, pageWidth / 2, 14, { align: 'center' });

  autoTable(doc, {
    startY: 20,
    head: [head],
    body,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.6, lineColor: [160, 160, 160], lineWidth: 0.1, textColor: 20 },
    headStyles: { fillColor: COLORS.header, textColor: 255, fontStyle: 'bold', halign: 'center' },
    columnStyles: Object.fromEntries(head.map((_, index) => [index, index < dimensionCount
      ? { halign: 'left', cellWidth: COLUMN_WIDTHS.dimensions[index] }
      : { halign: 'right', cellWidth: 'wrap' }])),
    margin: { left: 8, right: 8 },
    didParseCell: ({ section, row, cell }) => {
      if (section !== 'body') return;
      const kind = kinds[row.index];
      if (kind === 'subtotal') Object.assign(cell.styles, { fillColor: COLORS.subtotal, fontStyle: 'bold' });
      if (kind === 'grand') Object.assign(cell.styles, { fillColor: COLORS.grand, fontStyle: 'bold' });
    },
  });

  return doc;
}

export function exportPdf(report, title) {
  buildPdf(report, title).save(toFileName(title, 'pdf'));
}
