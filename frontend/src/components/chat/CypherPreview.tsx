import { useState } from 'react';
import { ChevronRight, ChevronDown, Code2 } from 'lucide-react';

interface Props {
  cypher: string;
}

export default function CypherPreview({ cypher }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <Code2 className="w-3 h-3" />
        <span>Cypher 쿼리</span>
      </button>
      {open && (
        <pre className="mt-1.5 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto font-mono border border-gray-700">
          {cypher}
        </pre>
      )}
    </div>
  );
}
