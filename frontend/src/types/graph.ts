export interface NodeData {
  id: string;
  label: string;
  properties: Record<string, unknown>;
}

export interface RelationshipData {
  id: string;
  type: string;
  source_id: string;
  target_id: string;
  properties: Record<string, unknown>;
}

export interface GraphData {
  nodes: NodeData[];
  relationships: RelationshipData[];
}
