import { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, RotateCcw,
  Cpu, Zap, AlertCircle, CheckCircle2, XCircle,
  Menu, ChevronDown, Repeat, SkipBack,
} from 'lucide-react';

const SPEEDS = [
  { label: '0.5×', value: 1600 },
  { label: '1×',   value: 800  },
  { label: '2×',   value: 400  },
  { label: '3×',   value: 200  },
];

function ModeToggle({ mode, onModeChange }) {
  return (
    <div
      className="flex rounded-xl overflow-hidden shrink-0"
      style={{ background: 'rgba(15,26,46,0.8)', border: '1px solid #1e2d4a' }}
    >
      {['DFA', 'NFA'].map(m => (
        <button
          key={m}
          onClick={() => onModeChange(m)}
          className="relative px-4 py-1.5 text-xs font-bold transition-all"
          style={{
            fontFamily: 'Space Mono',
            color: mode === m ? '#050912' : '#dadee4',
            zIndex: 1,
          }}
        >
          {mode === m && (
            <motion.div
              layoutId="modeIndicator"
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #00e5ff, #0891b2)',
                boxShadow: '0 0 15px rgba(0,229,255,0.4)',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10">{m}</span>
        </button>
      ))}
    </div>
  );
}

function SimButton({ onClick, disabled, title, icon: Icon, variant = 'default', active }) {
  const colors = {
    default: { bg: 'rgba(22,32,53,0.8)', border: '#1e2d4a', color: '#d8dde4', hover: '#8baad4' },
    primary: { bg: 'rgba(233, 241, 241, 0.1)', border: '#00e5ff', color: '#00e5ff', hover: '#00e5ff' },
    success: { bg: 'rgba(74,222,128,0.1)', border: '#4ade80', color: '#4ade80', hover: '#4ade80' },
    danger:  { bg: 'rgba(248,113,113,0.1)', border: '#f87171', color: '#f87171', hover: '#f87171' },
  };
  const c = colors[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: active ? `0 0 10px ${c.border}` : 'none',
      }}
    >
      <Icon size={14} />
    </motion.button>
  );
}

function SimRunModeToggle({ mode, onModeChange, disabled }) {
  const modes = [
    { label: 'Continuous', shortLabel: 'Cont.', value: 'continuous', icon: Repeat },
    { label: 'Discrete', shortLabel: 'Step', value: 'discrete', icon: SkipBack },
  ];

  return (
    <div
      className="flex rounded-lg overflow-hidden shrink-0"
      style={{
        border: '1px solid #1e2d4a',
        background: 'rgba(15,26,46,0.8)',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {modes.map(m => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          disabled={disabled}
          className="px-2.5 py-1 text-[10px] font-bold font-mono transition-all"
          style={{
            color: mode === m.value ? '#00e5ff' : '#e6e9ec',
            background: mode === m.value ? 'rgba(0,229,255,0.1)' : 'transparent',
            borderRight: '1px solid #1e2d4a',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

/* Compact mobile dropdown for sim run mode */
function SimRunModeDropdown({ mode, onModeChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  // Calculate position when opening
  const handleToggle = () => {
    if (disabled) return;
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const dropdownWidth = 140;
      let left = rect.left;
      // Prevent right-edge overflow
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8;
      }
      setPos({ top: rect.bottom + 4, left });
    }
    setOpen(o => !o);
  };

  const modes = [
    { label: 'Continuous', value: 'continuous', icon: Repeat },
    { label: 'Discrete', value: 'discrete', icon: SkipBack },
  ];
  const current = modes.find(m => m.value === mode) || modes[0];

  return (
    <div ref={ref}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={disabled}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all"
        style={{
          background: 'rgba(15,26,46,0.8)',
          border: '1px solid #1e2d4a',
          color: '#00e5ff',
          opacity: disabled ? 0.4 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <current.icon size={11} />
        <span>{current.label.slice(0, 4)}.</span>
        <ChevronDown
          size={10}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed rounded-lg overflow-hidden z-[9999]"
            style={{
              top: pos.top,
              left: pos.left,
              background: '#0d1520',
              border: '1px solid #1e2d4a',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              minWidth: 140,
            }}
          >
            {modes.map(m => {
              const Icon = m.icon;
              return (
                <button
                  key={m.value}
                  onClick={() => { onModeChange(m.value); setOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-bold font-mono transition-all"
                  style={{
                    color: mode === m.value ? '#00e5ff' : '#c8d8e8',
                    background: mode === m.value ? 'rgba(0,229,255,0.08)' : 'transparent',
                    borderBottom: '1px solid #1a2c45',
                  }}
                >
                  <Icon size={12} />
                  {m.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Vertical divider — hidden on mobile ── */
function Divider() {
  return (
    <div
      className="w-px h-6 mx-1 shrink-0 hidden md:block"
      style={{ background: '#fafbfcff' }}
    />
  );
}

export default function Navbar({
  mode, onModeChange,
  inputString, onInputChange,
  simStatus,
  onPlay, onPause, onStep, onReset, onStop,
  simResult,
  hasStartState,
  simSpeed, onSpeedChange,
  isAtLastStep,
  simRunMode, onSimRunModeChange,
  onToggleSidebar,
}) {
  const isRunning = simStatus === 'running';
  const isIdle = simStatus === 'idle';
  const isDone = simStatus === 'done';
  const canStep = !isRunning && simStatus !== 'idle';

  return (
    <header
      className="navbar-header flex flex-wrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-0 md:h-14 shrink-0"
      style={{
        borderBottom: '1px solid #1e2d4a',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
        onClick={onToggleSidebar}
        style={{
          background: 'rgba(22,32,53,0.8)',
          border: '1px solid #1e2d4a',
          color: '#d8dde4',
        }}
        title="Toggle sidebar"
      >
        <Menu size={16} />
      </button>

      {/* Logo / Title */}
      <div className="flex items-center gap-2.5 mr-1 md:mr-3 shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(0,229,255,0.3)',
          }}
        >
          <Cpu size={14} style={{ color: '#00e5ff' }} />
        </div>
        <span
          className="text-sm font-semibold tracking-tight hidden sm:inline"
          style={{ color: '#e2e8f0', fontFamily: 'Exo 2' }}
        >
          Automata<span style={{ color: '#00e5ff' }}>.</span>sim
        </span>
      </div>

      <Divider />

      {/* Mode toggle */}
      <ModeToggle mode={mode} onModeChange={onModeChange} />

      <Divider />

      {/* Input string */}
      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-full md:max-w-64 order-last md:order-none w-full md:w-auto">
        <label className="text-xs shrink-0 hidden sm:inline" style={{ color: '#e7eaee', fontFamily: 'Exo 2' }}>
          Input:
        </label>
        <input
          value={inputString}
          onChange={e => onInputChange(e.target.value)}
          placeholder={mode === 'NFA' ? "e.g. aab or ε" : "e.g. aab"}
          className="flex-1 px-3 py-1.5 rounded-lg text-sm font-mono sim-input"
          style={{ minWidth: 0 }}
          onKeyDown={e => { if (e.key === 'Enter' && hasStartState) onPlay(); }}
        />
      </div>

      <Divider />

      {/* Sim controls */}
      <div className="flex items-center gap-2 shrink-0">
        {isRunning ? (
          <SimButton onClick={onPause} icon={Pause} variant="primary" title="Pause (Space)" active />
        ) : (
          <SimButton
            onClick={onPlay}
            icon={Play}
            variant="primary"
            disabled={!hasStartState || (simRunMode === 'discrete' && !isIdle)}
            title={!hasStartState ? 'Set a start state first' : 'Play (Enter or Space)'}
          />
        )}
       {(simStatus === 'running' || simStatus === 'paused') && (
          <SimButton onClick={onStop} icon={XCircle} variant="danger" title="Stop" />
        )}
        <SimButton
          onClick={onStep}
          icon={SkipForward}
          disabled={!hasStartState || isIdle || isDone || isAtLastStep}
          title="Step forward"
        />
        <SimButton
          onClick={onReset}
          icon={RotateCcw}
          disabled={isIdle}
          title="Reset simulation"
        />
      </div>

      <Divider />

      {/* Speed control — hidden on very small screens */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <Zap size={12} style={{ color: '#dee4ec' }} />
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid #1e2d4a', background: 'rgba(15,26,46,0.8)' }}
        >
          {SPEEDS.map(s => (
            <button
              key={s.value}
              onClick={() => onSpeedChange(s.value)}
              className="px-2.5 py-1 text-[10px] font-bold font-mono transition-all"
              style={{
                color: simSpeed === s.value ? '#00e5ff' : '#e8ecf3',
                background: simSpeed === s.value ? 'rgba(0,229,255,0.1)' : 'transparent',
                borderRight: '1px solid #1e2d4a',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sim Run Mode — dropdown on mobile, inline toggle on desktop */}
      <div className="sm:hidden flex items-center gap-1.5 shrink-0">
        <SimRunModeDropdown
          mode={simRunMode}
          onModeChange={onSimRunModeChange}
          disabled={!isIdle}
        />
      </div>
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <SimRunModeToggle
          mode={simRunMode}
          onModeChange={onSimRunModeChange}
          disabled={!isIdle}
        />
      </div>

      {/* Result badge */}
      <div className="ml-auto shrink-0">
        {simResult === 'accepted' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid #4ade80',
              color: '#4ade80',
              boxShadow: '0 0 15px rgba(74,222,128,0.2)',
            }}
          >
            <CheckCircle2 size={12} />
            <span className="hidden sm:inline">ACCEPTED</span>
            <span className="sm:hidden">✓</span>
          </motion.div>
        )}
        {simResult === 'rejected' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid #f87171',
              color: '#f87171',
              boxShadow: '0 0 15px rgba(248,113,113,0.2)',
            }}
          >
            <XCircle size={12} />
            <span className="hidden sm:inline">REJECTED</span>
            <span className="sm:hidden">✗</span>
          </motion.div>
        )}
        {!simResult && !hasStartState && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
            style={{ color: '#f4f4f4ff' }}
          >
            <AlertCircle size={11} />
            <span className="hidden sm:inline">No start state</span>
          </div>
        )}
      </div>
    </header>
  );
}
