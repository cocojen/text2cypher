import { useRef, useEffect, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import type cytoscape from 'cytoscape';
import type { GraphData } from '../../types/graph';
import { COLORS } from '../../constants/colors';

interface Props {
  graphData: GraphData;
  highlightIds?: Set<string>;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  layout?: string;
}

export default function GraphCanvas({ graphData, highlightIds, onNodeClick, onEdgeClick, layout = 'cose-bilkent' }: Props) {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const labelColorMap = useRef<Map<string, string>>(new Map());

  const getColor = useCallback((label: string) => {
    if (!labelColorMap.current.has(label)) {
      labelColorMap.current.set(label, COLORS[labelColorMap.current.size % COLORS.length]);
    }
    return labelColorMap.current.get(label)!;
  }, []);

  // Cytoscape 요소 변환 (spread 후 id/source/target을 덮어써서 properties의 동명 필드가 덮지 않도록)
  const elements = [
    ...graphData.nodes.map(n => ({
      data: {
        ...n.properties,
        id: n.id,
        label: n.properties.name ?? n.label,
        nodeLabel: n.label,
      },
    })),
    ...graphData.relationships.map(r => ({
      data: {
        ...r.properties,
        id: r.id,
        source: r.source_id,
        target: r.target_id,
        label: r.type,
      },
    })),
  ];

  // 레이아웃 적용 (재마운트 시 요소 렌더링 완료 후 실행)
  useEffect(() => {
    if (cyRef.current && graphData.nodes.length > 0) {
      requestAnimationFrame(() => {
        if (!cyRef.current) return;
        const layoutObj = cyRef.current.layout({
          name: layout === 'cose-bilkent' ? 'cose-bilkent' : layout,
          animate: true,
          animationDuration: 500,
          nodeDimensionsIncludeLabels: true,
        } as cytoscape.LayoutOptions);
        layoutObj.run();
      });
    }
  }, [graphData, layout]);

  // 하이라이트 적용 (매칭 노드 강조 + 나머지 흐리게)
  useEffect(() => {
    if (!cyRef.current || !highlightIds) return;
    const cy = cyRef.current;
    cy.elements().removeClass('highlighted dimmed');

    if (highlightIds.size > 0) {
      // 하이라이트 대상이 아닌 요소들 흐리게
      cy.elements().addClass('dimmed');
      highlightIds.forEach(id => {
        const ele = cy.$id(id);
        ele.removeClass('dimmed').addClass('highlighted');
        // 하이라이트 노드에 연결된 엣지도 표시
        ele.connectedEdges().forEach(edge => {
          const srcId = edge.source().id();
          const tgtId = edge.target().id();
          if (highlightIds.has(srcId) && highlightIds.has(tgtId)) {
            edge.removeClass('dimmed').addClass('highlighted');
          }
        });
      });
    }
  }, [highlightIds]);

  const stylesheet: cytoscape.StylesheetStyle[] = [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': (ele: cytoscape.NodeSingular) => getColor(ele.data('nodeLabel') || 'Node'),
        color: '#fff',
        'text-outline-color': '#333',
        'text-outline-width': 1,
        'font-size': '12px',
        width: 50,
        height: 50,
      } as cytoscape.Css.Node,
    },
    {
      selector: 'edge',
      style: {
        label: 'data(label)',
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'line-color': '#94A3B8',
        'target-arrow-color': '#94A3B8',
        'font-size': '10px',
        color: '#475569',
        'text-rotation': 'autorotate',
        width: 2,
      } as cytoscape.Css.Edge,
    },
    {
      selector: '.dimmed',
      style: {
        opacity: 0.15,
      } as cytoscape.Css.Node,
    },
    {
      selector: 'node.highlighted',
      style: {
        'border-width': 6,
        'border-color': '#FACC15',
        'border-opacity': 1,
        width: 70,
        height: 70,
        'overlay-color': '#FACC15',
        'overlay-padding': 8,
        'overlay-opacity': 0.25,
        'z-index': 999,
      } as cytoscape.Css.Node,
    },
    {
      selector: 'edge.highlighted',
      style: {
        'line-color': '#FACC15',
        'target-arrow-color': '#FACC15',
        width: 4,
        'overlay-color': '#FACC15',
        'overlay-padding': 4,
        'overlay-opacity': 0.2,
        'z-index': 999,
      } as cytoscape.Css.Edge,
    },
  ];

  return (
    <CytoscapeComponent
      key={`${graphData.nodes.length}-${graphData.relationships.length}`}
      elements={elements}
      stylesheet={stylesheet}
      style={{ width: '100%', height: '100%' }}
      cy={(cy) => {
        cyRef.current = cy;
        cy.off('tap', 'node');
        cy.off('tap', 'edge');
        if (onNodeClick) {
          cy.on('tap', 'node', (evt) => onNodeClick(evt.target.id()));
        }
        if (onEdgeClick) {
          cy.on('tap', 'edge', (evt) => onEdgeClick(evt.target.id()));
        }
      }}
    />
  );
}
