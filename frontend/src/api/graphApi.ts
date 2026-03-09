import client from './client';
import type { GraphData, NodeData, RelationshipData } from '../types/graph';

export const graphApi = {
  getData: () =>
    client.get<GraphData>('/graph/data').then(r => r.data),

  createNode: (label: string, properties: Record<string, unknown>) =>
    client.post<NodeData>('/graph/nodes', { label, properties }).then(r => r.data),

  updateNode: (id: string, label: string | null, properties: Record<string, unknown>) =>
    client.put<NodeData>(`/graph/nodes/${encodeURIComponent(id)}`, { label, properties }).then(r => r.data),

  deleteNode: (id: string) =>
    client.delete(`/graph/nodes/${encodeURIComponent(id)}`),

  createRelationship: (sourceId: string, targetId: string, type: string, properties: Record<string, unknown>) =>
    client.post<RelationshipData>('/graph/relationships', {
      source_id: sourceId,
      target_id: targetId,
      type,
      properties,
    }).then(r => r.data),

  updateRelationship: (id: string, type: string | null, properties: Record<string, unknown>) =>
    client.put<RelationshipData>(`/graph/relationships/${encodeURIComponent(id)}`, { type, properties }).then(r => r.data),

  deleteRelationship: (id: string) =>
    client.delete(`/graph/relationships/${encodeURIComponent(id)}`),

  clearAll: () =>
    client.delete<{ ok: boolean; deleted_nodes: number }>('/graph/all').then(r => r.data),

  seedData: () =>
    client.post<{ ok: boolean; nodes: number; relationships: number }>('/graph/seed').then(r => r.data),
};
