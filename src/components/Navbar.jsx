import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, SkipForward, RotateCcw,
  Cpu, Zap, AlertCircle, CheckCircle2, XCircle,
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
      className="flex rounded-xl overflow-hidden"
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
    { label: 'Continuous', value: 'continuous' },
    { label: 'Discrete', value: 'discrete' },
  ];

  return (
    <div
      className="flex rounded-lg overflow-hidden"
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
}) {
  const isRunning = simStatus === 'running';
  const isIdle = simStatus === 'idle';
  const isDone = simStatus === 'done';
  const canStep = !isRunning && simStatus !== 'idle';

  return (
    <header
      className="flex items-center gap-3 px-4 h-14 shrink-0"
      style={{
        borderBottom: '1px solid #1e2d4a',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Logo / Title */}
      <div className="flex items-center gap-2.5 mr-3">
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
          className="text-sm font-semibold tracking-tight"
          style={{ color: '#e2e8f0', fontFamily: 'Exo 2' }}
        >
          Automata<span style={{ color: '#00e5ff' }}>.</span>sim
        </span>
      </div>

      <div
        className="w-px h-6 mx-1 shrink-0"
        style={{ background: '#fafbfcff' }}
      />

      {/* Mode toggle */}
      <ModeToggle mode={mode} onModeChange={onModeChange} />

      <div
        className="w-px h-6 mx-1 shrink-0"
        style={{ background: '#f4f4f4ff' }}
      />

      {/* Input string */}
      <div className="flex items-center gap-2 flex-1 max-w-64">
        <label className="text-xs shrink-0" style={{ color: '#e7eaee', fontFamily: 'Exo 2' }}>
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

      <div1
        className="w-px h-6 mx-1 shrink-0"
        style={{ background: '#f8f9fdff' }}
      />

      {/* Sim controls */}
      <div className="flex items-center gap-2">
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

      <div
        className="w-px h-6 mx-1 shrink-0"
        style={{ background: '#f5f6f9ff' }}
      />

      {/* Speed control */}
      <div className="flex items-center gap-1.5">
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

      {/* Sim Run Mode */}
      <div className="flex items-center gap-1.5">
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
            ACCEPTED
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
            REJECTED
          </motion.div>
        )}
        {!simResult && !hasStartState && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
            style={{ color: '#f4f4f4ff' }}
          >
            <AlertCircle size={11} />
            No start state
          </div>
        )}
      </div>
    </header>
  );
}
