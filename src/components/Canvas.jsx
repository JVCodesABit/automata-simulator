import { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GitBranch } from 'lucide-react';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

const nodeTypes = { customNode: CustomNode };
const edgeTypes = { customEdge: CustomEdge };

export default function Canvas({
  states,
  transitions,
  activeStates,
  activeTransitions,
  canvasMode,
  pendingFrom,
  onAddState,
  onPositionUpdate,
  onNodeClickHandler,
  onRemoveState,
  onSetStart,
  onToggleAccept,
  onRenameState,
}) {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync states → RF nodes
  useEffect(() => {
    setNodes(prev => {
      const prevMap = new Map(prev.map(n => [n.id, n]));

      return states.map(s => {
        const existing = prevMap.get(s.id);
        return {
          id: s.id,
          type: 'customNode',
          position: existing?.position ?? s.position,
          data: {
            label: s.label,
            isStart: s.isStart,
            isAccept: s.isAccept,
            isActive: activeStates.includes(s.id),
            isDead: false,
            canvasMode,
            pendingFrom,
            onNodeClick: onNodeClickHandler,
            onRemove: onRemoveState,
            onSetStart,
            onToggleAccept,
            onRename: onRenameState,
          },
          draggable: true,
          selectable: true,
        };
      });
    });
  }, [states, activeStates, canvasMode, pendingFrom, onNodeClickHandler, onRemoveState, onSetStart, onToggleAccept, onRenameState]);

  // Sync transitions → RF edges (group by from-to pair to merge labels)
  useEffect(() => {
    const edgeMap = new Map();

    transitions.forEach(t => {
      const key = `${t.from}|||${t.to}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, {
          id: `edge_${t.from}_${t.to}`,
          source: t.from,
          target: t.to,
          isSelf: t.from === t.to,
          labels: [t.label],
          ids: [t.id],
        });
      } else {
        const e = edgeMap.get(key);
        if (!e.labels.includes(t.label)) {
          e.labels.push(t.label);
          e.ids.push(t.id);
        }
      }
    });

    const newEdges = [...edgeMap.values()].map(e => {
      const isActive = e.ids.some(id => activeTransitions.includes(id));
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'customEdge',
        label: e.labels.join(', '),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isActive ? '#00e5ff' : '#ffffff',
          width: 14,
          height: 14,
        },
        data: {
          isActive,
          isSelf: e.isSelf,
        },
        selectable: false,
        focusable: false,
      };
    });

    setEdges(newEdges);
  }, [transitions, activeTransitions]);

  // Handle pane click: add state in addState mode
  const handlePaneClick = useCallback((event) => {
    if (canvasMode === 'addState') {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      onAddState(position);
    }
  }, [canvasMode, screenToFlowPosition, onAddState]);

  // Handle node drag stop → update parent positions
  const handleNodesChange = useCallback((changes) => {
    changes.forEach(change => {
      if (change.type === 'position' && !change.dragging && change.position) {
        onPositionUpdate(change.id, change.position);
      }
    });
    onNodesChange(changes);
  }, [onNodesChange, onPositionUpdate]);

  const cursorStyle = canvasMode === 'addState'
    ? 'crosshair'
    : canvasMode === 'addTransition'
      ? 'pointer'
      : 'default';

  return (
    <div className="relative flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        fitView={false}
        defaultViewport={{ x: 200, y: 150, zoom: 1 }}
        minZoom={0.3}
        maxZoom={2.5}
        style={{ cursor: cursorStyle }}
        panOnDrag={canvasMode === 'select'}
        nodesDraggable={canvasMode !== 'addTransition'}
      >
        <Background
          variant={BackgroundVariant.Lines}
          color="rgba(233, 222, 222, 0.23)"
          gap={60}
          lineWidth={1}
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
        />
      </ReactFlow>

      {/* Mode overlay hints */}
      <AnimatePresence>
        {canvasMode === 'addState' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium pointer-events-none"
            style={{
              background: 'rgba(0,229,255,0.1)',
              border: '1px solid rgba(0,229,255,0.3)',
              color: '#00e5ff',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Plus size={12} />
            Click anywhere to add a state
          </motion.div>
        )}
        {canvasMode === 'addTransition' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium pointer-events-none"
            style={{
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: '#a78bfa',
              backdropFilter: 'blur(8px)',
            }}
          >
            <GitBranch size={12} />
            {pendingFrom
              ? `From "${pendingFrom}" → click target state`
              : 'Click source state'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {states.length === 0 && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ color: '#edeff1' }}
        >
          <div
            className="text-6xl mb-4 opacity-30"
            style={{ fontFamily: 'Space Mono', userSelect: 'none' }}
          >q₀</div>
          <p className="text-sm opacity-50" style={{ fontFamily: 'Exo 2', color: '#f5f7fa' }}>
            Click "Add State" to begin
          </p>
        </div>
      )}
    </div>
  );
}
