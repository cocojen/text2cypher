import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '../../types/chat';
import CypherPreview from './CypherPreview';
import QueryResult from './QueryResult';

interface Props {
  messages: ChatMessage[];
  loading?: boolean;
}

export default function MessageList({ messages, loading }: Props) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-tertiary">
        <p>그래프에 대해 질문해보세요!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {/* 봇 아바타 */}
          {msg.role === 'assistant' && (
            <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-brand-600" />
            </div>
          )}

          <div
            className={`max-w-[80%] px-4 py-2.5 ${
              msg.role === 'user'
                ? 'bg-brand-600 text-white rounded-xl rounded-br-md shadow-xs'
                : 'bg-surface-tertiary text-text-primary border border-border-light rounded-xl rounded-bl-md'
            }`}
          >
            {msg.role === 'user' ? (
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            ) : (
              <div className="markdown text-sm">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            )}
            {msg.cypher && <CypherPreview cypher={msg.cypher} />}
            {msg.rawResults && msg.rawResults.length > 0 && (
              <QueryResult results={msg.rawResults} />
            )}
          </div>

          {/* 유저 아바타 */}
          {msg.role === 'user' && (
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      ))}
      {loading && (
        <div className="flex gap-2.5 justify-start">
          <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bot className="w-4 h-4 text-brand-600" />
          </div>
          <div className="rounded-xl rounded-bl-md px-4 py-3 bg-surface-tertiary border border-border-light text-text-tertiary">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">답변 생성 중...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
