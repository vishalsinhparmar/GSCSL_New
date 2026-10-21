export default function UploadPanel({ source, loading, error, onFile }) {
  return (
    <section className="card">
      <label className="dropzone">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          disabled={loading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
            event.target.value = '';
          }}
        />
        <strong>{loading ? 'Reading file...' : 'Choose raw data file (.xlsx, .xls, .csv)'}</strong>
        {source && (
          <span className="file-meta">
            {source.fileName} | sheet "{source.sheetName}" | {source.rows.length.toLocaleString()} rows
          </span>
        )}
      </label>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}
