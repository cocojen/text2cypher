import { useEffect, useState } from 'react';
import { Network, MessageCircle, Columns2 } from 'lucide-react';
import { useGraph } from './hooks/useGraph';
import { useChat } from './hooks/useChat';
import GraphCanvas from './components/graph/GraphCanvas';
import GraphCanvas3D from './components/graph/GraphCanvas3D';
import GraphToolbar from './components/graph/GraphToolbar';
import NodeDialog from './components/graph/NodeDialog';
import EdgeDialog from './components/graph/EdgeDialog';
import SchemaView from './components/schema/SchemaView';
import ChatPanel from './components/chat/ChatPanel';
import type { NodeData, RelationshipData } from './types/graph';
import './index.css';

type Tab = 'graph' | 'chat' | 'split';

function App() {
  const graph = useGraph();
  const chat = useChat();

  const [tab, setTab] = useState<Tab>('split');
  const [layout, setLayout] = useState('cose-bilkent');
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());

  // 노드 다이얼로그
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<NodeData | null>(null);

  // 관계 다이얼로그
  const [edgeDialogOpen, setEdgeDialogOpen] = useState(false);
  const [editingEdge, setEditingEdge] = useState<RelationshipData | null>(null);

  // 경로 탐색 패널
  const [pathFinderOpen, setPathFinderOpen] = useState(false);

  // 스키마 패널
  const [schemaOpen, setSchemaOpen] = useState(false);

  // 2D/3D 뷰 모드
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');

  // 초기 데이터 로드
  useEffect(() => {
    graph.refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 챗봇 결과에서 노드 하이라이트
  useEffect(() => {
    const lastMsg = chat.messages[chat.messages.length - 1];
    if (lastMsg?.role === 'assistant' && lastMsg.rawResults) {
      const ids = new Set<string>();

      if (lastMsg.matchedNodeIds && lastMsg.matchedNodeIds.length > 0) {
        lastMsg.matchedNodeIds.forEach(id => ids.add(id));
      } else {
        // 폴백: 결과 값으로 name 매칭
        const stringValues = new Set<string>();
        for (const row of lastMsg.rawResults) {
          for (const val of Object.values(row)) {
            if (typeof val === 'string') {
              stringValues.add(val);
            } else if (Array.isArray(val)) {
              for (const item of val) {
                if (typeof item === 'string') {
                  stringValues.add(item);
                }
              }
            }
          }
        }

        for (const node of graph.graphData.nodes) {
          const nodeName = node.properties.name;
          if (stringValues.has(node.id)) {
            ids.add(node.id);
          }
          if (typeof nodeName === 'string') {
            for (const sv of stringValues) {
              if (sv.toLowerCase() === nodeName.toLowerCase()) {
                ids.add(node.id);
                break;
              }
            }
          }
        }
      }

      setHighlightIds(ids);
    }
  }, [chat.messages, graph.graphData.nodes]);

  const handleNodeClick = (nodeId: string) => {
    const node = graph.graphData.nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNode(node);
      setNodeDialogOpen(true);
    }
  };

  const handleEdgeClick = (edgeId: string) => {
    const edge = graph.graphData.relationships.find(r => r.id === edgeId);
    if (edge) {
      setEditingEdge(edge);
      setEdgeDialogOpen(true);
    }
  };

  const handleNodeSave = async (label: string, properties: Record<string, unknown>) => {
    if (editingNode) {
      await graph.updateNode(editingNode.id, label, properties);
    } else {
      await graph.addNode(label, properties);
    }
  };

  const handleEdgeSave = async (sourceId: string, targetId: string, type: string, properties: Record<string, unknown>) => {
    if (editingEdge) {
      await graph.updateRelationship(editingEdge.id, type, properties);
    } else {
      await graph.addRelationship(sourceId, targetId, type, properties);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('모든 노드와 관계를 삭제합니다. 계속하시겠습니까?')) return;
    await graph.clearAll();
  };

  const handleSeedData = async () => {
    if (!window.confirm('샘플 시드 데이터를 삽입합니다. 계속하시겠습니까?')) return;
    await graph.seedData();
  };

  const tabList: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'graph', label: '그래프', icon: <Network className="w-4 h-4" /> },
    { key: 'chat', label: '챗봇', icon: <MessageCircle className="w-4 h-4" /> },
    { key: 'split', label: '분할', icon: <Columns2 className="w-4 h-4" /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-surface-secondary">
      {/* 헤더 */}
      <header className="bg-surface border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Network className="w-4.5 h-4.5 text-white" />
          </div>
          <h1 className="text-base font-bold text-text-primary">GraphRAG Practice</h1>
        </div>

        {/* 세그먼트 컨트롤 탭 */}
        <div className="bg-surface-tertiary p-1 rounded-lg flex gap-0.5">
          {tabList.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-surface text-text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 그래프 패널 */}
        {(tab === 'graph' || tab === 'split') && (
          <div className={`flex flex-col ${tab === 'split' ? 'w-1/2' : 'w-full'} border-r border-border`}>
            <GraphToolbar
              onAddNode={() => { setEditingNode(null); setNodeDialogOpen(true); }}
              onAddEdge={() => { setEditingEdge(null); setEdgeDialogOpen(true); }}
              layout={layout}
              onLayoutChange={setLayout}
              loading={graph.loading}
              onPathFinder={() => setPathFinderOpen(prev => !prev)}
              pathFinderActive={pathFinderOpen}
              nodeCount={graph.graphData.nodes.length}
              relCount={graph.graphData.relationships.length}
              onClearAll={handleClearAll}
              onSeedData={handleSeedData}
              onSchema={() => setSchemaOpen(prev => !prev)}
              schemaActive={schemaOpen}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            {schemaOpen ? (
              <SchemaView />
            ) : (
              <>
                {pathFinderOpen && (
                  <PathFinderWrapper
                    graphData={graph.graphData}
                    highlightIds={highlightIds}
                    setHighlightIds={setHighlightIds}
                  />
                )}
                <div className="flex-1 bg-surface relative">
                  {viewMode === '3d' ? (
                    <GraphCanvas3D
                      graphData={graph.graphData}
                      highlightIds={highlightIds}
                      onNodeClick={handleNodeClick}
                      onEdgeClick={handleEdgeClick}
                    />
                  ) : (
                    <GraphCanvas
                      graphData={graph.graphData}
                      highlightIds={highlightIds}
                      onNodeClick={handleNodeClick}
                      onEdgeClick={handleEdgeClick}
                      layout={layout}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* 챗봇 패널 */}
        {(tab === 'chat' || tab === 'split') && (
          <div className={`flex flex-col ${tab === 'split' ? 'w-1/2' : 'w-full'}`}>
            <ChatPanel
              messages={chat.messages}
              loading={chat.loading}
              onAsk={chat.ask}
              onRunCypher={chat.runCypher}
              onClear={chat.clearMessages}
            />
          </div>
        )}
      </main>

      {/* 다이얼로그 */}
      <NodeDialog
        open={nodeDialogOpen}
        node={editingNode}
        onClose={() => setNodeDialogOpen(false)}
        onSave={handleNodeSave}
        onDelete={(id) => graph.removeNode(id)}
      />
      <EdgeDialog
        open={edgeDialogOpen}
        edge={editingEdge}
        nodes={graph.graphData.nodes}
        onClose={() => setEdgeDialogOpen(false)}
        onSave={handleEdgeSave}
        onDelete={(id) => graph.removeRelationship(id)}
      />
    </div>
  );
}

// PathFinder 래퍼
import PathFinderPanel from './components/graph/PathFinderPanel';
import type { GraphData } from './types/graph';

function PathFinderWrapper({ graphData, highlightIds, setHighlightIds }: {
  graphData: GraphData;
  highlightIds: Set<string>;
  setHighlightIds: (ids: Set<string>) => void;
}) {
  return (
    <PathFinderPanel
      graphData={graphData}
      highlightIds={highlightIds}
      onHighlight={setHighlightIds}
    />
  );
}

export default App;
