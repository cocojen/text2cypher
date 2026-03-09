import {
  Plus, GitFork, Route, Database, Trash2,
  Square, Box, Layers,
} from 'lucide-react';

interface Props {
  onAddNode: () => void;
  onAddEdge: () => void;
  layout: string;
  onLayoutChange: (layout: string) => void;
  loading?: boolean;
  onPathFinder?: () => void;
  pathFinderActive?: boolean;
  nodeCount?: number;
  relCount?: number;
  onClearAll?: () => void;
  onSeedData?: () => void;
  onSchema?: () => void;
  schemaActive?: boolean;
  viewMode?: '2d' | '3d';
  onViewModeChange?: (mode: '2d' | '3d') => void;
}

const LAYOUTS = [
  { value: 'cose-bilkent', label: 'CoSE-Bilkent' },
  { value: 'circle', label: 'Circle' },
  { value: 'grid', label: 'Grid' },
  { value: 'concentric', label: 'Concentric' },
  { value: 'breadthfirst', label: 'Breadthfirst' },
];

export default function GraphToolbar({
  onAddNode, onAddEdge, layout, onLayoutChange,
  loading, onPathFinder, pathFinderActive,
  nodeCount, relCount, onClearAll, onSeedData,
  onSchema, schemaActive, viewMode = '3d', onViewModeChange,
}: Props) {
  return (
    <div className="bg-surface border-b border-border">
      {/* 1줄: 액션 버튼들 */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
        <button
          onClick={onAddNode}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          노드
        </button>
        <button
          onClick={onAddEdge}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-xs"
        >
          <GitFork className="w-3.5 h-3.5" />
          관계
        </button>
        {onPathFinder && (
          <button
            onClick={onPathFinder}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              pathFinderActive
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-surface border-border text-text-secondary hover:bg-surface-tertiary'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            경로 탐색
          </button>
        )}
        {onSchema && (
          <button
            onClick={onSchema}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              schemaActive
                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                : 'bg-surface border-border text-text-secondary hover:bg-surface-tertiary'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {schemaActive ? '그래프 보기' : '스키마'}
          </button>
        )}

        {/* 스페이서 */}
        <div className="flex-1" />

        {onSeedData && (
          <button
            onClick={onSeedData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border text-text-secondary rounded-lg text-sm font-medium hover:bg-surface-tertiary disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5" />
            시드 데이터
          </button>
        )}
        {onClearAll && (
          <button
            onClick={onClearAll}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-danger rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            전체 삭제
          </button>
        )}
      </div>

      {/* 2줄: 통계 + 뷰 설정 */}
      <div className="flex items-center justify-between px-3 pb-2">
        {nodeCount !== undefined ? (
          <span className="text-xs text-text-tertiary flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              노드 {nodeCount}개
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              관계 {relCount ?? 0}개
            </span>
          </span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {onViewModeChange && (
            <div className="bg-surface-tertiary p-0.5 rounded-lg flex gap-0.5">
              <button
                onClick={() => onViewModeChange('2d')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === '2d'
                    ? 'bg-surface text-text-primary shadow-xs'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                <Square className="w-3 h-3" />
                2D
              </button>
              <button
                onClick={() => onViewModeChange('3d')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === '3d'
                    ? 'bg-surface text-text-primary shadow-xs'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                <Box className="w-3 h-3" />
                3D
              </button>
            </div>
          )}
          <span className="text-xs text-text-tertiary">레이아웃:</span>
          <select
            value={layout}
            onChange={e => onLayoutChange(e.target.value)}
            disabled={viewMode === '3d'}
            className="border border-border rounded-lg px-2 py-1 text-sm bg-surface disabled:opacity-50"
          >
            {LAYOUTS.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
