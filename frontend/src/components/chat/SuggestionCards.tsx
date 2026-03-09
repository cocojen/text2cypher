import { Sparkles, MessageCircle } from 'lucide-react';

export interface Suggestion {
  category: string;
  color: string;
  question: string;
  description?: string;
}

interface Props {
  onSelect: (question: string) => void;
  title?: string;
  suggestions?: Suggestion[];
  compact?: boolean;
}

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { category: '다중 홉 경로', color: 'bg-brand-50 border-brand-200 text-brand-700', question: '강민혁(Dylan)의 보고 라인을 대표이사까지 보여줘', description: 'REPORTS_TO 재귀 탐색' },
  { category: '다중 홉 경로', color: 'bg-brand-50 border-brand-200 text-brand-700', question: '신유진(Olivia)이랑 홍예진(Emma)은 조직상 몇 단계 떨어져 있어?', description: '최단 경로 탐색' },
  { category: '역방향 트리', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', question: '정하준(CTO) 산하 전체 인원과 팀 구성을 보여줘', description: '하향식 트리 펼치기' },
  { category: '역방향 트리', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', question: '각 부문장 산하에 몇 명이 있어?', description: '직·간접 인원 집계' },
  { category: '구조적 패턴', color: 'bg-amber-50 border-amber-200 text-amber-700', question: '겸직자 전원과 겸직 현황을 알려줘', description: '다중 소속 탐지' },
  { category: '구조적 패턴', color: 'bg-amber-50 border-amber-200 text-amber-700', question: '팀장 없이 운영되는 팀은?', description: '조직 이상 탐지' },
  { category: '조직 계층', color: 'bg-rose-50 border-rose-200 text-rose-700', question: '기술부문의 전체 조직 트리와 인원을 보여줘', description: 'PART_OF 재귀 펼치기' },
  { category: '집계·분석', color: 'bg-purple-50 border-purple-200 text-purple-700', question: '부문별 인력 분포를 알려줘', description: '경영진 관점 집계' },
];

export default function SuggestionCards({ onSelect, title = 'GraphRAG 챗봇', suggestions, compact }: Props) {
  const items = suggestions ?? DEFAULT_SUGGESTIONS;

  // 컴팩트 모드: 가로 스크롤 바
  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto px-3 py-2 border-b border-border bg-surface-secondary" style={{ scrollbarWidth: 'thin' }}>
        <Sparkles className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0 mt-1" />
        {items.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s.question)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:shadow-sm hover:-translate-y-0.5 bg-surface border-border text-text-secondary hover:text-text-primary hover:border-brand-300"
          >
            {s.question}
          </button>
        ))}
      </div>
    );
  }

  // 기본 모드: 그리드 레이아웃
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-brand-500" />
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        </div>
        <p className="text-sm text-text-tertiary">그래프 데이터에 대해 자유롭게 질문하세요</p>
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-2xl w-full">
        {items.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s.question)}
            className={`text-left p-3.5 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${s.color}`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{s.category}</span>
            <p className="text-sm mt-1.5 font-medium">{s.question}</p>
            {s.description && <p className="text-xs mt-1 opacity-60">{s.description}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
