import client from './client';
import type { ChatResponse, CypherResponse } from '../types/chat';

export const chatApi = {
  ask: (question: string) =>
    client.post<ChatResponse>('/chat/ask', { question }).then(r => r.data),

  runCypher: (cypher: string) =>
    client.post<CypherResponse>('/chat/cypher', { cypher }).then(r => r.data),
};
