import client from './client';
import type { ShortestPathResponse } from '../types/analysis';

export const analysisApi = {
  shortestPath: (sourceId: string, targetId: string, maxDepth = 10) =>
    client.post<ShortestPathResponse>('/analysis/shortest-path', {
      source_id: sourceId,
      target_id: targetId,
      max_depth: maxDepth,
    }).then(r => r.data),
};
