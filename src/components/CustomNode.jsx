import { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomNode = memo(({ id, data }) => {
  const {
    label, isStart, isAccept, isActive, isDead,
    canvasMode, pendingFrom,
    onNodeClick, onRemove, onSetStart, onToggleAccept, onRename,
  } = data;

  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(label);
  const inputRef = useRef(null);
  const isSourcePending = pendingFrom === id;

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (canvasMode === 'addTransition') {
      onNodeClick(id);
    }
  }, [canvasMode, id, onNodeClick]);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (canvasMode !== 'addTransition') {
      setEditing(true);
      setEditLabel(label);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [label, canvasMode]);

  const commitRename = useCallback(() => {
    if (editLabel.trim() && editLabel.trim() !== label) {
      onRename(id, editLabel.trim());
    }
    setEditing(false);
  }, [editLabel, label, id, onRename]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setEditing(false); setEditLabel(label); }
  }, [commitRename, label]);

  // Color logic
  let borderColor = '#cfd6e0';
  let textColor = '#d8dfe7';
  let shadowStyle = {};

  if (isActive) {
    borderColor = '#00e5ff';
    textColor = '#00e5ff';
    shadowStyle = {
      boxShadow: '0 0 20px rgba(0,229,255,0.6), 0 0 40px rgba(0,229,255,0.3)',
    };
  } else if (isDead) {
    borderColor = '#f87171';
    textColor = '#f87171';
    shadowStyle = { boxShadow: '0 0 12px rgba(248,113,113,0.4)' };
  } else if (isAccept) {
    borderColor = '#4ade80';
    textColor = '#4ade80';
  } else if (isSourcePending) {
    borderColor = '#a78bfa';
    textColor = '#a78bfa';
    shadowStyle = { boxShadow: '0 0 12px rgba(167,139,250,0.5)' };
  }

  const showHoverMenu = showMenu && canvasMode === 'select';

  return (
    <div
      className="relative flex items-center justify-center"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      style={{ cursor: canvasMode === 'addTransition' ? 'crosshair' : 'pointer' }}
    >
      {/* Start state arrow indicator */}
      {isStart && (
        <div
          className="absolute flex items-center pointer-events-none"
          style={{ right: 'calc(100% + 2px)', top: '50%', transform: 'translateY(-50%)' }}
        >
          <div
            className="h-px"
            style={{ width: 28, background: 'linear-gradient(to right, transparent, #00e5ff)' }}
          />
          <div
            style={{
              width: 0, height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: '8px solid #00e5ff',
            }}
          />
        </div>
      )}

      {/* Hover action menu */}
      <AnimatePresence>
        {showHoverMenu && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="absolute flex gap-1 z-50 nodrag nopan"
            style={{ bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onSetStart(id); }}
              title="Set start state"
              className="flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold font-mono transition-all"
              style={{
                background: isStart ? '#0891b2' : 'rgba(15,26,46,0.95)',
                border: `1px solid ${isStart ? '#0891b2' : '#334155'}`,
                color: isStart ? 'white' : '#94a3b8',
                backdropFilter: 'blur(8px)',
              }}
            >S</button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleAccept(id); }}
              title="Toggle accept state"
              className="flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold font-mono transition-all"
              style={{
                background: isAccept ? '#166534' : 'rgba(15,26,46,0.95)',
                border: `1px solid ${isAccept ? '#4ade80' : '#334155'}`,
                color: isAccept ? '#4ade80' : '#94a3b8',
                backdropFilter: 'blur(8px)',
              }}
            >A</button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(id); }}
              title="Delete state"
              className="flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold transition-all"
              style={{
                background: 'rgba(15,26,46,0.95)',
                border: '1px solid #334155',
                color: '#f87171',
                backdropFilter: 'blur(8px)',
              }}
            >×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* State circle */}
      <motion.div
        className="relative flex items-center justify-center rounded-full select-none"
        style={{
          width: 56,
          height: 56,
          border: `2px solid ${borderColor}`,
          background: 'linear-gradient(135deg, #0f1a2e 0%, #0a1120 100%)',
          transition: 'border-color 0.25s, color 0.25s',
          ...shadowStyle,
        }}
        animate={isActive ? {
          boxShadow: [
            '0 0 10px rgba(0,229,255,0.3)',
            '0 0 35px rgba(0,229,255,0.8), 0 0 60px rgba(0,229,255,0.4)',
            '0 0 10px rgba(0,229,255,0.3)',
          ],
        } : {}}
        transition={isActive ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.25 }}
      >
        {/* Accept state inner ring */}
        {isAccept && (
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 4,
              border: `1.5px solid ${borderColor}`,
              borderRadius: '50%',
              opacity: 0.8,
            }}
          />
        )}

        {/* Label / Edit input */}
        {editing ? (
          <input
            ref={inputRef}
            value={editLabel}
            onChange={e => setEditLabel(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleKeyDown}
            onClick={e => e.stopPropagation()}
            className="w-10 text-center bg-transparent border-none outline-none font-mono text-xs font-bold"
            style={{ color: textColor }}
            maxLength={8}
          />
        ) : (
          <span
            className="font-mono text-sm font-bold z-10 leading-none"
            style={{ color: textColor, userSelect: 'none' }}
          >
            {label}
          </span>
        )}

        {/* Active pulse ring */}
        {isActive && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: -8,
              border: '2px solid rgba(0,229,255,0.4)',
              borderRadius: '50%',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>

      {/* Invisible handles on all sides */}
      <Handle type="source" position={Position.Top}    id="s-t"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right}  id="s-r"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Bottom} id="s-b"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Left}   id="s-l"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Top}    id="t-t"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Right}  id="t-r"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Bottom} id="t-b"  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left}   id="t-l"  style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
export default CustomNode;
