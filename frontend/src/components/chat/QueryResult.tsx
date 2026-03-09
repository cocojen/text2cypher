import { useState } from 'react';
import { ChevronRight, ChevronDown, Table2 } from 'lucide-react';

interface Props {
  results: Record<string, unknown>[];
}

export default function QueryResult({ results }: Props) {
  const [open, setOpen] = useState(false);

  if (results.length === 0) return null;

  const columns = Object.keys(results[0]);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <Table2 className="w-3 h-3" />
        <span>결과 ({results.length}건)</span>
      </button>
      {open && (
        <div className="mt-1.5 overflow-x-auto rounded-lg border border-border">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr className="bg-surface-tertiary">
                {columns.map(col => (
                  <th key={col} className="px-3 py-2 text-left font-medium text-text-secondary border-b border-border">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 50).map((row, i) => (
                <tr key={i} className="hover:bg-surface-secondary transition-colors">
                  {columns.map(col => (
                    <td key={col} className="px-3 py-1.5 border-b border-border-light text-text-primary">
                      {formatValue(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {results.length > 50 && (
            <p className="text-xs text-text-tertiary px-3 py-2 bg-surface-secondary">... 외 {results.length - 50}건</p>
          )}
        </div>
      )}
    </div>
  );
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}
