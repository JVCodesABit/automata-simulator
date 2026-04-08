import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import { motion } from 'framer-motion';

const CustomEdge = memo(({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition, targetPosition,
  label,
  data,
  markerEnd,
  selected,
}) => {
  const isActive = data?.isActive ?? false;
  const isSelf = data?.isSelf ?? false;
  const curveOffset = data?.curveOffset ?? 0;

  let edgePath, labelX, labelY;

  if (isSelf) {
    // Self-loop: draw a tight loop above the node
    const loopSize = 22;
    const cx = sourceX;
    const startY = sourceY + 2;
    const cy = startY - loopSize * 2.4;
    edgePath = `M ${sourceX - 8} ${startY}
      C ${sourceX - loopSize * 1.6} ${cy}
        ${sourceX + loopSize * 1.6} ${cy}
        ${sourceX + 8} ${startY}`;
    labelX = cx;
    labelY = cy + 6;
  } else if (curveOffset !== 0) {
    // Bidirectional edge: offset a quadratic bezier perpendicular to the straight line
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    // Always compute perpendicular from a canonical direction (left-to-right / top-to-bottom)
    // so both edges of a bidirectional pair curve in opposite directions
    const canonicalDx = Math.abs(targetX - sourceX) || 1;
    const canonicalDy = sourceX <= targetX ? (targetY - sourceY) : (sourceY - targetY);
    const len = Math.sqrt(canonicalDx * canonicalDx + canonicalDy * canonicalDy) || 1;
    // Perpendicular unit vector (consistent regardless of edge direction)
    const px = -canonicalDy / len;
    const py = canonicalDx / len;
    const ctrlX = midX + px * curveOffset;
    const ctrlY = midY + py * curveOffset;
    edgePath = `M ${sourceX} ${sourceY} Q ${ctrlX} ${ctrlY} ${targetX} ${targetY}`;
    // Label at the curve midpoint (t=0.5 for quadratic bezier)
    labelX = (sourceX + 2 * ctrlX + targetX) / 4;
    labelY = (sourceY + 2 * ctrlY + targetY) / 4;
  } else {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX, sourceY, sourcePosition,
      targetX, targetY, targetPosition,
    });
  }

  const strokeColor = isActive ? '#00e5ff' : selected ? '#8b5cf6' : '#e9ecf0';
  const strokeWidth = isActive ? 2.5 : 1.5;
  const glowFilter = isActive
    ? 'drop-shadow(0 0 6px rgba(0,229,255,0.8)) drop-shadow(0 0 12px rgba(0,229,255,0.4))'
    : 'none';

  return (
    <>
      {/* Glow layer when active */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke="rgba(0,229,255,0.2)"
          strokeWidth={8}
          strokeLinecap="round"
        />
      )}

      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={markerEnd}
        style={{
          filter: glowFilter,
          transition: 'stroke 0.3s, stroke-width 0.3s',
        }}
      />

      {/* Animated dot along the edge */}
      {isActive && (
        <motion.circle
          r={4}
          fill="#00e5ff"
          style={{ filter: 'drop-shadow(0 0 4px rgba(0,229,255,1))' }}
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: ['0%', '100%'] }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <animateMotion
            dur="0.6s"
            repeatCount="1"
            path={edgePath}
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
        </motion.circle>
      )}

      {/* Edge label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 10,
            }}
          >
            <motion.div
              animate={isActive ? {
                scale: [1, 1.15, 1],
                transition: { duration: 0.4 },
              } : {}}
              className="font-mono font-bold text-xs px-2 py-0.5 rounded"
              style={{
                background: isActive
                  ? '#00e5ff'
                  : selected
                    ? 'rgba(139,92,246,0.2)'
                    : 'rgba(15,26,46,0.9)',
                border: `1px solid ${isActive ? '#00e5ff' : selected ? '#8b5cf6' : '#ffffff'}`,
                color: isActive ? '#050912' : selected ? '#c4b5fd' : '#e7ebf1',
                backdropFilter: 'blur(8px)',
                boxShadow: isActive ? '0 0 12px rgba(0,229,255,0.5)' : 'none',
                transition: 'background 0.3s, color 0.3s, border-color 0.3s',
                fontSize: '11px',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </motion.div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
export default CustomEdge;
