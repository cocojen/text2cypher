export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  cypher?: string;
  rawResults?: Record<string, unknown>[];
  matchedNodeIds?: string[];
}

export interface ChatResponse {
  question: string;
  cypher: string;
  raw_results: Record<string, unknown>[];
  answer: string;
  matched_node_ids?: string[];
}

export interface CypherResponse {
  cypher: string;
  results: Record<string, unknown>[];
  matched_node_ids?: string[];
}
