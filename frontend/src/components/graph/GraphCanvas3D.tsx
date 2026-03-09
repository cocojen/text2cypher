import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import type { ForceGraphMethods } from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import type { GraphData } from '../../types/graph';
import { COLORS } from '../../constants/colors';

interface Props {
  graphData: GraphData;
  highlightIds?: Set<string>;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
}

export default function GraphCanvas3D({ graphData, highlightIds, onNodeClick, onEdgeClick }: Props) {
  const fgRef = useRef<ForceGraphMethods>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelColorMap = useRef<Map<string, string>>(new Map());

  const getColor = useCallback((label: string) => {
    if (!labelColorMap.current.has(label)) {
      labelColorMap.current.set(label, COLORS[labelColorMap.current.size % COLORS.length]);
    }
    return labelColorMap.current.get(label)!;
  }, []);

  // 그래프 데이터를 ForceGraph3D 형식으로 변환
  const data = useMemo(() => ({
    nodes: graphData.nodes.map(n => ({
      id: n.id,
      name: (n.properties.name as string) ?? n.label,
      nodeLabel: n.label,
      val: highlightIds && highlightIds.size > 0 && highlightIds.has(n.id) ? 3 : 1,
    })),
    links: graphData.relationships.map(r => ({
      id: r.id,
      source: r.source_id,
      target: r.target_id,
      type: r.type,
    })),
  }), [graphData, highlightIds]);

  // 초기 로드 시 카메라 줌
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      const timer = setTimeout(() => {
        fgRef.current?.zoomToFit(400, 80);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [graphData.nodes.length]);

  // 컨테이너 크기 추적
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hasHighlight = highlightIds && highlightIds.size > 0;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#F8FAFC"
        showNavInfo={false}
        nodeLabel="name"
        nodeColor={(node: any) => {
          if (hasHighlight && !highlightIds!.has(node.id)) {
            return '#d1d5db'; // 비매칭 노드: 회색
          }
          return getColor(node.nodeLabel || 'Node');
        }}
        nodeOpacity={hasHighlight ? 0.9 : 1}
        nodeVal={(node: any) => node.val}
        nodeThreeObjectExtend={true}
        nodeThreeObject={(node: any) => {
          // 노드 이름 텍스트 스프라이트
          const sprite = new SpriteText(node.name);
          sprite.color = hasHighlight && !highlightIds!.has(node.id) ? '#9ca3af' : '#1f2937';
          sprite.textHeight = 3;
          sprite.position.y = 12;
          return sprite;
        }}
        linkLabel={(link: any) => link.type}
        linkColor={() => '#94A3B8'}
        linkWidth={1}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={() => '#94A3B8'}
        linkOpacity={hasHighlight ? 0.3 : 0.6}
        onNodeClick={(node: any) => {
          if (onNodeClick && node.id) onNodeClick(node.id);
        }}
        onLinkClick={(link: any) => {
          if (onEdgeClick && link.id) onEdgeClick(link.id);
        }}
      />
    </div>
  );
}
