import { useState } from "react";
import { Link } from "react-router-dom";
import { apiImportCsv } from "../lib/api";
import type { ImportCardsResult } from "../types/import";

export function StockImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportCardsResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await apiImportCsv(file);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const failures = result?.results.filter((r) => !r.ok && r.row > 0) ?? [];

  return (
    <div className="mx-auto max-w-lg">
      <Link to="/cards" className="text-sm text-brand-600 hover:underline">
        ← Back to stock
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">Import stock from CSV</h1>
      <p className="mt-2 text-sm text-slate-600">
        Bulk-add active inventory. Required: <strong>player_name</strong>, <strong>year</strong>,{" "}
        <strong>brand</strong>. Optional <strong>purchase_price</strong> (cost),{" "}
        <strong>estimated_value</strong> (asking price), and <strong>image_url</strong> (public http(s) link).
      </p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <a
          href="/stock-import-template.csv"
          download="stock-import-template.csv"
          className="touch-target inline-flex items-center text-sm font-semibold text-brand-600 hover:underline"
        >
          Download CSV template
        </a>
        <p className="mt-2 text-xs text-slate-500">
          Max 500 rows, 2MB. Good rows import even if some rows fail.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">CSV file</label>
          <input
            type="file"
            accept=".csv,text/csv"
            required
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setResult(null);
              setError("");
            }}
            className="input-mobile w-full text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="touch-target w-full rounded-xl bg-brand-600 py-3.5 text-base font-bold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Importing…" : "Import stock"}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-lg font-semibold text-slate-900">Import complete</p>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-medium text-green-700">{result.imported} imported</span>
            {result.failed > 0 && (
              <>
                {" "}
                · <span className="font-medium text-red-700">{result.failed} failed</span>
              </>
            )}
          </p>

          {failures.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-800">Failed rows</p>
              <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm">
                {failures.map((row) => (
                  <li key={row.row} className="rounded-lg bg-red-50 px-3 py-2 text-red-800">
                    <span className="font-medium">Line {row.row}:</span>{" "}
                    {row.errors?.join("; ") ?? "Unknown error"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            to="/cards"
            className="touch-target mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View stock
          </Link>
        </div>
      )}
    </div>
  );
}
