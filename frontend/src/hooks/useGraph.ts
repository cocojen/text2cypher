import { useState, useCallback } from 'react';
import { graphApi } from '../api/graphApi';
import type { GraphData } from '../types/graph';

export function useGraph() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], relationships: [] });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await graphApi.getData();
      setGraphData(data);
    } catch (err) {
      console.error('그래프 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNode = useCallback(async (label: string, properties: Record<string, unknown>) => {
    await graphApi.createNode(label, properties);
    await refresh();
  }, [refresh]);

  const updateNode = useCallback(async (id: string, label: string | null, properties: Record<string, unknown>) => {
    await graphApi.updateNode(id, label, properties);
    await refresh();
  }, [refresh]);

  const removeNode = useCallback(async (id: string) => {
    await graphApi.deleteNode(id);
    await refresh();
  }, [refresh]);

  const addRelationship = useCallback(async (
    sourceId: string, targetId: string, type: string, properties: Record<string, unknown>
  ) => {
    await graphApi.createRelationship(sourceId, targetId, type, properties);
    await refresh();
  }, [refresh]);

  const updateRelationship = useCallback(async (id: string, type: string | null, properties: Record<string, unknown>) => {
    await graphApi.updateRelationship(id, type, properties);
    await refresh();
  }, [refresh]);

  const removeRelationship = useCallback(async (id: string) => {
    await graphApi.deleteRelationship(id);
    await refresh();
  }, [refresh]);

  const clearAll = useCallback(async () => {
    await graphApi.clearAll();
    await refresh();
  }, [refresh]);

  const seedData = useCallback(async () => {
    await graphApi.seedData();
    await refresh();
  }, [refresh]);

  return {
    graphData,
    loading,
    refresh,
    addNode,
    updateNode,
    removeNode,
    addRelationship,
    updateRelationship,
    removeRelationship,
    clearAll,
    seedData,
  };
}
