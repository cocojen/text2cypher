export interface PathNode {
  id: string;
  label: string;
  properties: Record<string, unknown>;
}

export interface PathRelationship {
  id: string;
  type: string;
  source_id: string;
  target_id: string;
  properties: Record<string, unknown>;
}

export interface ShortestPathResponse {
  found: boolean;
  path_length: number;
  nodes: PathNode[];
  relationships: PathRelationship[];
}
