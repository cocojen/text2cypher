import { useState, useCallback } from 'react';
import { chatApi } from '../api/chatApi';
import type { ChatMessage } from '../types/chat';

let messageId = 0;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const ask = useCallback(async (question: string) => {
    const userMsg: ChatMessage = {
      id: String(++messageId),
      role: 'user',
      content: question,
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatApi.ask(question);
      const assistantMsg: ChatMessage = {
        id: String(++messageId),
        role: 'assistant',
        content: res.answer,
        cypher: res.cypher,
        rawResults: res.raw_results,
        matchedNodeIds: res.matched_node_ids,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: String(++messageId),
        role: 'assistant',
        content: `오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, []);

  const runCypher = useCallback(async (cypher: string) => {
    const userMsg: ChatMessage = {
      id: String(++messageId),
      role: 'user',
      content: `[Cypher] ${cypher}`,
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatApi.runCypher(cypher);
      const assistantMsg: ChatMessage = {
        id: String(++messageId),
        role: 'assistant',
        content: `${res.results.length}건의 결과`,
        cypher: res.cypher,
        rawResults: res.results,
        matchedNodeIds: res.matched_node_ids,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: String(++messageId),
        role: 'assistant',
        content: `Cypher 실행 오류: ${err instanceof Error ? err.message : String(err)}`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, loading, ask, runCypher, clearMessages };
}
