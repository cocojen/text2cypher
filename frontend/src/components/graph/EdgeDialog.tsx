import { useState, useEffect } from 'react';
import { ArrowRight, X, Save, Trash2 } from 'lucide-react';
import type { NodeData, RelationshipData } from '../../types/graph';
import { schemaApi } from '../../api/schemaApi';
import ComboboxInput from '../common/ComboboxInput';

interface Props {
  open: boolean;
  edge?: RelationshipData | null;
  nodes: NodeData[];
  onClose: () => void;
  onSave: (sourceId: string, targetId: string, type: string, properties: Record<string, unknown>) => void;
  onDelete?: (id: string) => void;
}

export default function EdgeDialog({ open, edge, nodes, onClose, onSave, onDelete }: Props) {
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [type, setType] = useState('');
  const [propsText, setPropsText] = useState('{}');
  const [typeOptions, setTypeOptions] = useState<string[]>([]);

  // 다이얼로그 열릴 때 기존 관계 타입 목록 로드
  useEffect(() => {
    if (open) {
      schemaApi.getRelationshipTypes().then(setTypeOptions).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (edge) {
      setSourceId(edge.source_id);
      setTargetId(edge.target_id);
      setType(edge.type);
      setPropsText(JSON.stringify(edge.properties, null, 2));
    } else {
      setSourceId(nodes[0]?.id ?? '');
      setTargetId(nodes[0]?.id ?? '');
      setType('');
      setPropsText('{}');
    }
  }, [edge, nodes, open]);

  if (!open) return null;

  const getNodeDisplayName = (n: NodeData) =>
    `[${n.label}] ${(n.properties.name as string) ?? n.id}`;

  const handleSave = () => {
    try {
      const props = JSON.parse(propsText);
      onSave(sourceId, targetId, type, props);
      onClose();
    } catch {
      alert('JSON 형식이 올바르지 않습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface rounded-xl shadow-xl w-96 border border-border overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">
              {edge ? '관계 수정' : '관계 추가'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-tertiary hover:text-text-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 바디 */}
        <div className="px-5 py-4 space-y-4">
          {!edge && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">출발 노드</label>
                <select
                  value={sourceId}
                  onChange={e => setSourceId(e.target.value)}
                  className="w-full border border-border bg-surface-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{getNodeDisplayName(n)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">도착 노드</label>
                <select
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  className="w-full border border-border bg-surface-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{getNodeDisplayName(n)}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">관계 타입</label>
            <ComboboxInput
              value={type}
              onChange={setType}
              options={typeOptions}
              placeholder="예: KNOWS, WORKS_AT"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">속성 (JSON)</label>
            <textarea
              value={propsText}
              onChange={e => setPropsText(e.target.value)}
              className="w-full border border-border bg-surface-secondary rounded-lg px-3 py-2 font-mono text-sm h-24 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-secondary">
          <div>
            {edge && onDelete && (
              <button
                onClick={() => { onDelete(edge.id); onClose(); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-danger rounded-lg text-sm font-medium hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-tertiary"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!type.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
