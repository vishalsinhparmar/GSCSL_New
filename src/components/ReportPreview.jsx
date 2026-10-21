import { toReportTable } from '../lib/reportTable.js';

export default function ReportPreview({ report, title }) {
  const { head, body, kinds, dimensionCount } = toReportTable(report);

  return (
    <div className="table-wrap">
      <h2 className="report-title">{title}</h2>
      <table className="report-table">
        <thead>
          <tr>
            {head.map((label, index) => (
              <th key={label} className={index < dimensionCount ? 'text' : 'number'}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex} className={kinds[rowIndex] !== 'detail' ? `row-${kinds[rowIndex]}` : undefined}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cellIndex < dimensionCount ? 'text' : 'number'}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
