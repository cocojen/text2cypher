import { useState, useEffect } from 'react';
import { CircleDot, X, Save, Trash2 } from 'lucide-react';
import type { NodeData } from '../../types/graph';
import { schemaApi } from '../../api/schemaApi';
import ComboboxInput from '../common/ComboboxInput';

interface Props {
  open: boolean;
  node?: NodeData | null;
  onClose: () => void;
  onSave: (label: string, properties: Record<string, unknown>) => void;
  onDelete?: (id: string) => void;
}

export default function NodeDialog({ open, node, onClose, onSave, onDelete }: Props) {
  const [label, setLabel] = useState('');
  const [propsText, setPropsText] = useState('');
  const [labelOptions, setLabelOptions] = useState<string[]>([]);

  // 다이얼로그 열릴 때 기존 레이블 목록 로드
  useEffect(() => {
    if (open) {
      schemaApi.getLabels().then(setLabelOptions).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (node) {
      setLabel(node.label);
      setPropsText(JSON.stringify(node.properties, null, 2));
    } else {
      setLabel('');
      setPropsText('{\n  "name": ""\n}');
    }
  }, [node, open]);

  if (!open) return null;

  const handleSave = () => {
    try {
      const props = JSON.parse(propsText);
      onSave(label, props);
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
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
              <CircleDot className="w-4 h-4 text-brand-600" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">
              {node ? '노드 수정' : '노드 추가'}
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
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">레이블</label>
            <ComboboxInput
              value={label}
              onChange={setLabel}
              options={labelOptions}
              placeholder="예: Person, Company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">속성 (JSON)</label>
            <textarea
              value={propsText}
              onChange={e => setPropsText(e.target.value)}
              className="w-full border border-border bg-surface-secondary rounded-lg px-3 py-2 font-mono text-sm h-32 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-secondary">
          <div>
            {node && onDelete && (
              <button
                onClick={() => { onDelete(node.id); onClose(); }}
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
              disabled={!label.trim()}
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
