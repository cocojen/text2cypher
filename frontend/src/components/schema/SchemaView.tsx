import { useEffect, useState } from 'react';
import { CircleDot, GitBranch, Layers, ArrowRightLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { schemaApi, type SchemaFullDetails } from '../../api/schemaApi';
import { COLORS } from '../../constants/colors';

// 레이블 → 색상 매핑 (GraphCanvas와 동일 순서)
function getLabelColor(label: string, labels: string[]): string {
  const idx = labels.indexOf(label);
  return COLORS[idx >= 0 ? idx % COLORS.length : 0];
}

export default function SchemaView() {
  const [data, setData] = useState<SchemaFullDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLabels, setExpandedLabels] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    schemaApi.getFullDetails()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (label: string) => {
    setExpandedLabels(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-tertiary">스키마 로딩 중...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-tertiary">스키마 정보를 불러올 수 없습니다</p>
      </div>
    );
  }

  const nodeLabels = Object.keys(data.node_types.counts);

  const statCards = [
    { label: '전체 노드', value: data.summary.total_nodes, icon: CircleDot, iconBg: 'bg-brand-100', iconColor: 'text-brand-600' },
    { label: '전체 관계', value: data.summary.total_relationships, icon: GitBranch, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { label: '노드 타입', value: data.summary.node_type_count, icon: Layers, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    { label: '관계 타입', value: data.summary.relationship_type_count, icon: ArrowRightLeft, iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-surface-secondary">
      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-surface rounded-xl shadow-xs border border-border p-4">
              <div className="text-xs text-text-tertiary mb-2">{stat.label}</div>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
                <span className="text-2xl font-bold text-text-primary">{stat.value.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 노드 타입 카드 그리드 */}
      <h2 className="text-base font-semibold text-text-primary mb-3">노드 타입</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {nodeLabels.map(label => {
          const count = data.node_types.counts[label];
          const props = data.node_types.properties[label] || [];
          const color = getLabelColor(label, nodeLabels);
          const expanded = expandedLabels.has(`node:${label}`);

          return (
            <div key={label} className="bg-surface rounded-xl shadow-xs border border-border overflow-hidden">
              <button
                onClick={() => toggleExpand(`node:${label}`)}
                className="w-full flex items-center justify-between p-3 hover:bg-surface-secondary transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-text-primary">{label}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                    style={{ backgroundColor: color }}
                  >
                    {count.toLocaleString()}
                  </span>
                  {expanded
                    ? <ChevronUp className="w-3.5 h-3.5 text-text-tertiary" />
                    : <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
                  }
                </span>
              </button>
              {expanded && props.length > 0 && (
                <div className="px-4 pb-3 border-t border-border bg-surface-secondary">
                  <div className="pt-2 text-xs text-text-secondary space-y-1">
                    {props.map(prop => (
                      <div key={prop} className="flex items-center gap-1.5">
                        <span className="text-text-tertiary">•</span>
                        <span>{prop}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 관계 패턴 목록 */}
      <h2 className="text-base font-semibold text-text-primary mb-3">관계 패턴</h2>
      <div className="bg-surface rounded-xl shadow-xs border border-border overflow-hidden">
        {data.relationship_patterns.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-6">관계 패턴이 없습니다</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-secondary text-left text-text-secondary">
                <th className="px-4 py-2.5 font-medium">패턴</th>
                <th className="px-4 py-2.5 font-medium text-right">건수</th>
              </tr>
            </thead>
            <tbody>
              {data.relationship_patterns.map((p, i) => (
                <tr key={i} className="border-t border-border hover:bg-surface-secondary transition-colors">
                  <td className="px-4 py-2.5">
                    <code className="text-sm">
                      <span className="text-brand-600">(:{p.from_label})</span>
                      <span className="text-text-tertiary"> ─[</span>
                      <span className="text-emerald-600">{p.rel_type}</span>
                      <span className="text-text-tertiary">]─&gt; </span>
                      <span className="text-brand-600">(:{p.to_label})</span>
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-right text-text-secondary font-medium">
                    {p.count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
