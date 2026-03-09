import { useState } from 'react';
import { Route, Search, RotateCcw } from 'lucide-react';
import { analysisApi } from '../../api/analysisApi';
import type { GraphData } from '../../types/graph';
import type { ShortestPathResponse } from '../../types/analysis';

interface Props {
  graphData: GraphData;
  highlightIds: Set<string>;
  onHighlight: (ids: Set<string>) => void;
}

export default function PathFinderPanel({ graphData, onHighlight }: Props) {
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortestPathResponse | null>(null);
  const [error, setError] = useState('');

  // 노드 목록 (드롭다운용)
  const nodeOptions = graphData.nodes.map(n => ({
    id: n.id,
    display: `[${n.label}] ${(n.properties.name as string) ?? n.id}`,
  }));

  const handleSearch = async () => {
    if (!sourceId || !targetId) return;
    if (sourceId === targetId) {
      setError('출발 노드와 도착 노드가 같습니다');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await analysisApi.shortestPath(sourceId, targetId);
      setResult(res);

      if (res.found) {
        // 경로의 노드 + 관계 ID를 하이라이트
        const ids = new Set<string>();
        res.nodes.forEach(n => ids.add(n.id));
        res.relationships.forEach(r => ids.add(r.id));
        onHighlight(ids);
      } else {
        onHighlight(new Set());
      }
    } catch {
      setError('경로 탐색 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setError('');
    onHighlight(new Set());
  };

  // 경로 텍스트 렌더링
  const renderPath = (res: ShortestPathResponse) => {
    if (!res.found) return <p className="text-sm text-text-tertiary">경로를 찾을 수 없습니다</p>;

    const parts: React.ReactNode[] = [];
    for (let i = 0; i < res.nodes.length; i++) {
      const node = res.nodes[i];
      const name = (node.properties.name as string) ?? node.label;
      parts.push(
        <span key={`n-${i}`} className="font-medium text-brand-700">{name}</span>
      );
      if (i < res.relationships.length) {
        const rel = res.relationships[i];
        // 방향 판단
        const isForward = rel.source_id === res.nodes[i].id;
        parts.push(
          <span key={`r-${i}`} className="text-xs mx-1">
            <span className="text-text-tertiary">{isForward ? '' : '<'}─[</span>
            <span className="text-emerald-600">{rel.type}</span>
            <span className="text-text-tertiary">]─{isForward ? '>' : ''}</span>
          </span>
        );
      }
    }
    return <div className="flex items-center flex-wrap gap-y-1">{parts}</div>;
  };

  return (
    <div className="border-b border-border bg-surface px-3 py-3">
      <div className="flex items-center gap-2 mb-2.5">
        <Route className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-text-primary">경로 탐색</span>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-xs text-text-tertiary mb-1 block">출발 노드</label>
          <select
            value={sourceId}
            onChange={e => setSourceId(e.target.value)}
            className="w-full border border-border bg-surface-secondary rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">선택...</option>
            {nodeOptions.map(n => (
              <option key={n.id} value={n.id}>{n.display}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-text-tertiary mb-1 block">도착 노드</label>
          <select
            value={targetId}
            onChange={e => setTargetId(e.target.value)}
            className="w-full border border-border bg-surface-secondary rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">선택...</option>
            {nodeOptions.map(n => (
              <option key={n.id} value={n.id}>{n.display}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !sourceId || !targetId}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 shadow-xs"
        >
          <Search className="w-3.5 h-3.5" />
          {loading ? '탐색중...' : '탐색'}
        </button>
        {result && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary hover:bg-surface-tertiary"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        )}
      </div>

      {error && <p className="text-sm text-danger mt-2">{error}</p>}

      {result && (
        <div className="mt-2.5 p-3 bg-surface-secondary rounded-lg border border-border text-sm">
          {result.found ? (
            <>
              <div className="text-xs text-text-tertiary mb-1.5">
                경로 길이: {result.path_length}
              </div>
              {renderPath(result)}
            </>
          ) : (
            <p className="text-text-tertiary">두 노드 사이에 경로가 존재하지 않습니다</p>
          )}
        </div>
      )}
    </div>
  );
}
