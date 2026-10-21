import { useMemo, useState } from 'react';
import UploadPanel from './components/UploadPanel.jsx';
import ReportPreview from './components/ReportPreview.jsx';
import { readRawFile } from './lib/workbook.js';
import { buildPivot } from './lib/pivot.js';
import { buildReportTitle } from './lib/calculations.js';
import { exportExcel, exportPdf } from './lib/exporters.js';
import { DEFAULT_TIME_WINDOW } from './lib/reportConfig.js';
import './App.css';

export default function App() {
  const [source, setSource] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const report = useMemo(() => (source ? buildPivot(source.rows) : null), [source]);

  async function handleFile(file) {
    setLoading(true);
    setError('');
    try {
      const data = await readRawFile(file);
      setSource({ ...data, fileName: file.name });
      setTitle(buildReportTitle(data.rows, DEFAULT_TIME_WINDOW));
    } catch (err) {
      setSource(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Last Mile Report Generator</h1>
        <p>Upload the raw export. Trip, DC, EPOD and End Trip measures are calculated automatically.</p>
      </header>

      <UploadPanel source={source} loading={loading} error={error} onFile={handleFile} />

      {report && (
        <section className="card">
          <div className="report-toolbar">
            <label className="title-field">
              <span>Report title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <div className="export-buttons">
              <button type="button" onClick={() => exportPdf(report, title)} disabled={!title.trim()}>Download PDF</button>
              <button type="button" className="secondary" onClick={() => exportExcel(report, title)} disabled={!title.trim()}>Download Excel</button>
            </div>
          </div>
          <ReportPreview report={report} title={title} />
        </section>
      )}
    </main>
  );
}
