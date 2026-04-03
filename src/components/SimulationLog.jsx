import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Loader2, Circle,
} from 'lucide-react';

function StepRow({ step, isCurrent, isCompleted }) {
  const isDeadStep = step.dead;

  /* ── row background ── */
  let bg = 'transparent';
  let borderColor = '#1a2c45';
  let rowOpacity = 1;

  if (isCurrent && !isDeadStep) {
    bg = 'rgba(41,212,245,0.07)';
    borderColor = '#29d4f5';
  } else if (isCurrent && isDeadStep) {
    bg = 'rgba(248,113,113,0.08)';
    borderColor = '#f87171';
  } else if (isCompleted) {
    rowOpacity = 1;
  }

  /* ── text color ── */
  const descColor = isCurrent
    ? (isDeadStep ? '#fca5a5' : '#93e4f5')
    : '#e4e7ec';

  const consumedColor = isCurrent ? '#d7dde2' : '#dce0e6';
  const nextCharColor = isDeadStep ? '#f87171' : '#29d4f5';
  const remainingColor = isCurrent ? '#3a566e' : '#d9e0e7';

  /* ── state badge ── */
  const badgeBg = isCurrent
    ? (isDeadStep ? 'rgba(248,113,113,0.14)' : 'rgba(41,212,245,0.12)')
    : 'rgba(26,44,69,0.6)';
  const badgeBorder = isCurrent
    ? (isDeadStep ? '#f87171' : '#29d4f5')
    : '#1a2c45';
  const badgeText = isCurrent
    ? (isDeadStep ? '#f87171' : '#29d4f5')
    : '#dcdee0';

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: rowOpacity, x: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-xs transition-all"
      style={{
        background: bg,
        borderLeft: `2px solid ${borderColor}`,
      }}
    >
      {/* Step number */}
      <span
        className="font-mono shrink-0 w-5 sm:w-6 text-right tabular-nums"
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: isCurrent ? '#fbbf24' : '#d8e0eb',
          letterSpacing: '0.02em',
        }}
      >
        {step.stepIndex}
      </span>

      {/* Input tape */}
      {step.consumed !== undefined && (
        <div
          className="font-mono shrink-0"
          style={{ fontSize: 12, letterSpacing: '0.04em' }}
        >
          <span style={{ color: consumedColor }}>{step.consumed}</span>
          {isCurrent && step.remaining?.length > 0 && (
            <>
              <span
                style={{
                  color: nextCharColor,
                  fontWeight: 800,
                  borderBottom: `1.5px solid ${nextCharColor}`,
                  paddingBottom: 1,
                }}
              >
                {step.remaining[0]}
              </span>
              <span style={{ color: remainingColor }}>{step.remaining.slice(1)}</span>
            </>
          )}
          {isCurrent && step.remaining?.length === 0 && (
            <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
          )}
        </div>
      )}

      {/* Divider */}
      <div
        className="w-px h-4 shrink-0 hidden sm:block"
        style={{ background: isCurrent ? '#1a3050' : '#b8c5d4' }}
      />

      {/* State badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(step.activeStates ?? []).map(s => (
          <span
            key={s}
            className="font-mono px-2 py-0.5 rounded"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.03em',
              background: badgeBg,
              border: `1px solid ${badgeBorder}`,
              color: badgeText,
            }}
          >
            {s}
          </span>
        ))}
        {step.dead && (
          <span
            style={{ fontSize: 13, color: '#f87171', fontWeight: 600 }}
          >
            ∅
          </span>
        )}
      </div>

      {/* Description — truncated and hidden on very small screens */}
      <span
        className="ml-auto shrink-0 max-w-[120px] sm:max-w-[220px] text-right truncate hidden xs:inline"
        style={{
          fontSize: 11,
          color: descColor,
          fontFamily: 'inherit',
          letterSpacing: '0.01em',
        }}
        title={step.description}
      >
        {step.description}
      </span>
    </motion.div>
  );
}

export default function SimulationLog({
  simData, currentStep, simResult, simStatus, inputString,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && !collapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStep, collapsed]);

  const hasData = simData && simData.steps.length > 0;
  const isRunning = simStatus === 'running';
  const isIdle = simStatus === 'idle';

  return (
    <motion.div
      animate={{ height: collapsed ? 44 : 'clamp(160px, 35vh, 320px)' }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="simlog-container shrink-0 overflow-hidden"
      style={{
        borderTop: '1px solid #1a2c45',
        background: '#000000',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 h-11 shrink-0 cursor-pointer select-none"
        onClick={() => setCollapsed(c => !c)}
        style={{
          borderBottom: collapsed ? 'none' : '1px solid #1a2c45',
          background: '#0d1825',
        }}
      >
        <Terminal size={12} style={{ color: '#dfe3e7' }} />

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#e0e3e6',
            fontFamily: 'inherit',
          }}
        >
          <span className="hidden sm:inline">Simulation Log</span>
          <span className="sm:hidden">Log</span>
        </span>

        {hasData && (
          <span
            className="font-mono tabular-nums"
            style={{ fontSize: 11, color: '#e9ecf0', letterSpacing: '0.03em' }}
          >
            — {currentStep} / {simData.steps.length - 1}
          </span>
        )}

        {isRunning && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'flex' }}
          >
            <Loader2 size={11} style={{ color: '#29d4f5' }} />
          </motion.div>
        )}

        {/* Result badge */}
        {simResult === 'accepted' && (
          <div
            className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded"
            style={{
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.3)',
            }}
          >
            <CheckCircle2 size={11} style={{ color: '#34d399' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.06em' }}>
              <span className="hidden sm:inline">ACCEPTED</span>
              <span className="sm:hidden">✓</span>
            </span>
          </div>
        )}
        {simResult === 'rejected' && (
          <div
            className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded"
            style={{
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
            }}
          >
            <XCircle size={11} style={{ color: '#f87171' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171', letterSpacing: '0.06em' }}>
              <span className="hidden sm:inline">REJECTED</span>
              <span className="sm:hidden">✗</span>
            </span>
          </div>
        )}

        <button
          className="ml-auto flex items-center justify-center"
          style={{ color: '#2e4a6a' }}
          onClick={e => { e.stopPropagation(); setCollapsed(c => !c); }}
        >
          {collapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* ── Log content ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            ref={scrollRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-y-auto simlog-scroll"
            style={{
              /* Custom scrollbar */
              scrollbarWidth: 'thin',
              scrollbarColor: '#1a2c45 transparent',
            }}
          >
            {isIdle && !hasData && (
              <div
                className="flex items-center gap-2 px-4 py-4"
                style={{ color: '#d6dde6', fontSize: 12 }}
              >
                <Circle size={9} />
                <span style={{ letterSpacing: '0.02em' }}>
                  Ready — press Play or Enter to simulate
                </span>
              </div>
            )}

            {hasData && simData.steps.map((step, i) => (
              <StepRow
                key={i}
                step={step}
                isCurrent={i === currentStep}
                isCompleted={i < currentStep}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}