import client from './client';

export interface NodeDetails {
  counts: Record<string, number>;
  properties: Record<string, string[]>;
}

export interface RelationshipDetails {
  types: string[];
  properties: Record<string, string[]>;
}

export interface RelationshipPattern {
  from_label: string;
  rel_type: string;
  to_label: string;
  count: number;
}

export interface SchemaFullDetails {
  summary: {
    total_nodes: number;
    total_relationships: number;
    node_type_count: number;
    relationship_type_count: number;
  };
  node_types: {
    counts: Record<string, number>;
    properties: Record<string, string[]>;
  };
  relationship_types: {
    types: string[];
    properties: Record<string, string[]>;
  };
  relationship_patterns: RelationshipPattern[];
}

export const schemaApi = {
  getLabels: () =>
    client.get<{ labels: string[] }>('/schema/labels').then(r => r.data.labels),
  getRelationshipTypes: () =>
    client.get<{ types: string[] }>('/schema/relationship-types').then(r => r.data.types),
  getNodeDetails: () =>
    client.get<NodeDetails>('/schema/node-details').then(r => r.data),
  getRelationshipDetails: () =>
    client.get<RelationshipDetails>('/schema/relationship-details').then(r => r.data),
  getFullDetails: () =>
    client.get<SchemaFullDetails>('/schema/full-details').then(r => r.data),
};
