import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Code2, Send, RotateCcw } from 'lucide-react';
import type { ChatMessage } from '../../types/chat';
import MessageList from './MessageList';
import SuggestionCards from './SuggestionCards';

export interface Suggestion {
  category: string;
  color: string;
  question: string;
}

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  onAsk: (question: string) => void;
  onRunCypher: (cypher: string) => void;
  onClear: () => void;
  title?: string;
  suggestions?: Suggestion[];
  placeholder?: string;
}

export default function ChatPanel({ messages, loading, onAsk, onRunCypher, onClear, title = 'GraphRAG 챗봇', suggestions, placeholder }: Props) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'natural' | 'cypher'>('natural');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 메시지 추가 또는 로딩 시 자동 스크롤
  useEffect(() => {
    const container = document.getElementById('chat-scroll');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    if (mode === 'cypher') {
      onRunCypher(trimmed);
    } else {
      onAsk(trimmed);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm text-text-primary">{title}</h3>

          {/* 세그먼트 컨트롤 모드 토글 */}
          <div className="bg-surface-tertiary p-0.5 rounded-lg flex gap-0.5">
            <button
              onClick={() => setMode('natural')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                mode === 'natural'
                  ? 'bg-surface text-text-primary shadow-xs'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              자연어
            </button>
            <button
              onClick={() => setMode('cypher')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                mode === 'cypher'
                  ? 'bg-surface text-text-primary shadow-xs'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Code2 className="w-3 h-3" />
              Cypher
            </button>
          </div>
        </div>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-danger transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          초기화
        </button>
      </div>

      {/* 추천 질문 (항상 표시) */}
      <SuggestionCards compact onSelect={onAsk} suggestions={suggestions} />

      {/* 메시지 목록 */}
      <div id="chat-scroll" className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-tertiary text-sm">위 추천 질문을 클릭하거나 직접 질문을 입력하세요</p>
          </div>
        ) : (
          <MessageList messages={messages} loading={loading} />
        )}
      </div>

      {/* 입력 */}
      <div className="p-3 border-t border-border bg-surface">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'natural' ? (placeholder ?? '그래프에 대해 질문하세요...') : 'MATCH (n) RETURN n LIMIT 10'}
            className="flex-1 border border-border bg-surface-secondary rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            rows={2}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="w-10 h-10 flex items-center justify-center bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 self-end shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
