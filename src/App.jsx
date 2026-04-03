import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import SimulationLog from './components/SimulationLog';
import TransitionModal from './components/TransitionModal';
import { computeDFASteps, computeNFASteps, validateAutomata } from './utils/automataEngine';
import '@xyflow/react/dist/style.css';

let stateCounter = 0;


// Toast notification component
function Toast({ message, type, onDismiss }) {
  const colors = {
    success: { bg: 'rgba(74,222,128,0.12)', border: '#4ade80', color: '#4ade80' },
    error: { bg: 'rgba(248,113,113,0.12)', border: '#f87171', color: '#f87171' },
    warning: { bg: 'rgba(251,191,36,0.12)', border: '#fbbf24', color: '#fbbf24' },
    info: { bg: 'rgba(0,229,255,0.12)', border: '#00e5ff', color: '#00e5ff' },
  };
  const c = colors[type] ?? colors.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium max-w-xs"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        fontFamily: 'Exo 2',
      }}
    >
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} style={{ color: c.color, opacity: 0.6 }}>
        <X size={12} />
      </button>
    </motion.div>
  );
}

export default function App() {
  // Automata state
  const [mode, setMode] = useState('DFA');
  const [states, setStates] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [alphabet, setAlphabet] = useState([]); // DFA defined alphabet

  // Warn before page refresh/close
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = 'Refreshing will result in loss of data';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Canvas interaction mode
  const [canvasMode, setCanvasMode] = useState('select');
  const [pendingFrom, setPendingFrom] = useState(null);

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Transition modal
  const [transitionModal, setTransitionModal] = useState(null); // { from, to } | null

  // Simulation
  const [inputString, setInputString] = useState('');
  const [simStatus, setSimStatus] = useState('idle'); // idle | running | paused | done
  const [simData, setSimData] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [simSpeed, setSimSpeed] = useState(800);
  const [simRunMode, setSimRunMode] = useState('continuous'); // continuous | discrete
  const simTimerRef = useRef(null);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    const effectiveDuration = type === 'error' ? 5000 : duration;
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), effectiveDuration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ─── Automata builders ─────────────────────────────────────────────────────

  const addState = useCallback((position) => {
    const id = `q${stateCounter++}`;
    const isFirst = states.length === 0;
    setStates(prev => [...prev, {
      id,
      label: id,
      isStart: isFirst,
      isAccept: false,
      position,
    }]);
  }, [states.length]);

  const removeState = useCallback((id) => {
    setStates(prev => prev.filter(s => s.id !== id));
    setTransitions(prev => prev.filter(t => t.from !== id && t.to !== id));
  }, []);

  const updateStatePosition = useCallback((id, position) => {
    setStates(prev => prev.map(s => s.id === id ? { ...s, position } : s));
  }, []);

  const setStartState = useCallback((id) => {
    setStates(prev => prev.map(s => ({ ...s, isStart: s.id === id })));
  }, []);

  const toggleAcceptState = useCallback((id) => {
    setStates(prev => prev.map(s => s.id === id ? { ...s, isAccept: !s.isAccept } : s));
  }, []);

  const renameState = useCallback((id, label) => {
    // Also update any transitions referencing old label
    setStates(prev => prev.map(s => s.id === id ? { ...s, label } : s));
  }, []);

  const addTransition = useCallback((from, to, label) => {
    const id = `t_${from}_${to}_${Date.now()}`;
    setTransitions(prev => {
      const exists = prev.some(t => t.from === from && t.to === to && t.label === label);
      if (exists) {
        addToast(`Transition ${from} →[${label}]→ ${to} already exists.`, 'error');
        return prev;
      }
      addToast(`Transition ${from} →[${label}]→ ${to} added`, 'info', 2000);
      return [...prev, { id, from, to, label }];
    });
  }, [addToast]);

  const removeTransition = useCallback((id) => {
    setTransitions(prev => prev.filter(t => t.id !== id));
  }, []);

  const addAlphabetSymbol = useCallback((symbol) => {
    const s = symbol.trim();
    if (!s || s === 'ε') return;
    setAlphabet(prev => prev.includes(s) ? prev : [...prev, s]);
  }, []);

  const removeAlphabetSymbol = useCallback((symbol) => {
    setAlphabet(prev => prev.filter(s => s !== symbol));
  }, []);

  const clearAll = useCallback(() => {
    stateCounter = 0;
    setStates([]);
    setTransitions([]);
    setAlphabet([]);
    setSimStatus('idle');
    setCurrentStep(-1);
    setSimData(null);
    setCanvasMode('select');
    setPendingFrom(null);
  }, []);

  // ─── Transition flow ───────────────────────────────────────────────────────

  // Refs to hold the latest values so the click handler never goes stale
  const pendingFromRef = useRef(pendingFrom);
  const canvasModeRef = useRef(canvasMode);
  useEffect(() => { pendingFromRef.current = pendingFrom; }, [pendingFrom]);
  useEffect(() => { canvasModeRef.current = canvasMode; }, [canvasMode]);

  const handleNodeClick = useCallback((nodeId) => {
    if (canvasModeRef.current !== 'addTransition') return;

    if (!pendingFromRef.current) {
      setPendingFrom(nodeId);
    } else {
      // Open modal for label
      setTransitionModal({ from: pendingFromRef.current, to: nodeId });
      setPendingFrom(null);
      setCanvasMode('addTransition'); // stay in transition mode for next one
    }
  }, []);

  const handleTransitionSubmit = useCallback((label) => {
    if (transitionModal) {
      addTransition(transitionModal.from, transitionModal.to, label);
    }
    setTransitionModal(null);
  }, [transitionModal, addTransition]);

  const cancelTransition = useCallback(() => {
    setPendingFrom(null);
    setCanvasMode('select');
  }, []);

  // ─── Simulation ────────────────────────────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
  }, []);

  const startSimulation = useCallback(() => {
    const { errors, warnings } = validateAutomata(states, transitions, mode, alphabet);

    if (errors.length > 0) {
      errors.forEach(e => addToast(e, 'error', 4000));
      return;
    }
    warnings.forEach(w => addToast(w, 'warning', 3500));

    stopTimer();
    setCanvasMode('select');

    const startState = states.find(s => s.isStart);
    let result;

    if (mode === 'DFA') {
      result = computeDFASteps(inputString, startState.id, transitions, states);
    } else {
      result = computeNFASteps(inputString, startState.id, transitions, states);
    }

    setSimData(result);
    setCurrentStep(0);
    setSimStatus(simRunMode === 'continuous' ? 'running' : 'paused');
  }, [states, transitions, mode, inputString, stopTimer, addToast, simRunMode, alphabet]);

  const pauseSimulation = useCallback(() => {
    stopTimer();
    setSimStatus('paused');
  }, [stopTimer]);

  const resumeSimulation = useCallback(() => {
    setSimStatus('running');
  }, []);

  const stepForward = useCallback(() => {
    if (!simData) return;
    stopTimer();
    setSimStatus('paused');
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, simData.steps.length - 1);

      if (next === simData.steps.length - 1) {
        setSimStatus('done');
      }
      return next;
    });
  }, [simData, stopTimer]);

  const resetSimulation = useCallback(() => {
    stopTimer();
    setCurrentStep(-1);
    setSimData(null);
    setSimStatus('idle');
  }, [stopTimer]);

  const handleStop = useCallback(() => {
    stopTimer();
    setCurrentStep(-1);
    setSimData(null);
    setSimStatus('idle');
    addToast('Simulation stopped.', 'info', 2000);
  }, [stopTimer, addToast]);

  // Auto-advance when running
  useEffect(() => {
    if (simStatus !== 'running' || !simData) return;

    simTimerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= simData.steps.length) {
          setSimStatus('done');
          return prev;
        }
        return next;
      });
    }, simSpeed);

    return () => clearInterval(simTimerRef.current);
  }, [simStatus, simData, simSpeed]);

  // Show toast on completion
  useEffect(() => {
    if (simStatus === 'done' && simData) {
      stopTimer();
      if (simData.accepted) {
        addToast('String ACCEPTED ✅ — reached an accepting state', 'success', 4000);
      } else {
        addToast('String REJECTED ❌ — no accepting state reached', 'error', 4000);
      }
    }
  }, [simStatus, simData, stopTimer, addToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (simStatus === 'running') pauseSimulation();
        else if (simStatus === 'paused') resumeSimulation();
        else if (simStatus === 'idle') startSimulation();
        else if (simStatus === 'done') resetSimulation();
      }

      if (e.code === 'Enter') {
        if (simStatus === 'idle') startSimulation();
      }

      if (e.code === 'Escape') {
        if (canvasMode !== 'select') {
          cancelTransition();
          setCanvasMode('select');
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [simStatus, canvasMode, startSimulation, pauseSimulation, resumeSimulation, resetSimulation, cancelTransition]);

  // ─── Derived values ────────────────────────────────────────────────────────

  const currentSimStep = simData?.steps?.[currentStep] ?? null;
  const activeStates = currentSimStep?.activeStates ?? [];
  const activeTransitions = currentSimStep?.activeTransitions ?? [];
  const simResult = simStatus === 'done' ? (simData?.accepted ? 'accepted' : 'rejected') : null;
  const isAtLastStep = simData ? currentStep >= simData.steps.length - 1 : false;
  const hasStartState = states.some(s => s.isStart);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
    >
      <Navbar
        mode={mode}
        onModeChange={(m) => { setMode(m); resetSimulation(); }}
        inputString={inputString}
        onInputChange={setInputString}
        simStatus={simStatus}
        onPlay={simStatus === 'paused' ? resumeSimulation : startSimulation}
        onPause={pauseSimulation}
        onStep={stepForward}
        onReset={resetSimulation}
        onStop={handleStop}
        simResult={simResult}
        hasStartState={hasStartState}
        simSpeed={simSpeed}
        onSpeedChange={setSimSpeed}
        isAtLastStep={isAtLastStep}
        simRunMode={simRunMode}
        onSimRunModeChange={setSimRunMode}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          states={states}
          transitions={transitions}
          canvasMode={canvasMode}
          onCanvasModeChange={(m) => {
            setCanvasMode(m);
            if (m !== 'addTransition') setPendingFrom(null);
          }}
          onClear={clearAll}
          onRemoveTransition={removeTransition}
          pendingTransition={pendingFrom ? { from: pendingFrom } : null}
          onCancelTransition={cancelTransition}
          simStatus={simStatus}
          mode={mode}
          alphabet={alphabet}
          onAddAlphabetSymbol={addAlphabetSymbol}
          onRemoveAlphabetSymbol={removeAlphabetSymbol}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex flex-col flex-1 overflow-hidden canvas-wrapper">
          <Canvas
            states={states}
            transitions={transitions}
            activeStates={activeStates}
            activeTransitions={activeTransitions}
            canvasMode={canvasMode}
            pendingFrom={pendingFrom}
            onAddState={addState}
            onPositionUpdate={updateStatePosition}
            onNodeClickHandler={handleNodeClick}
            onRemoveState={removeState}
            onSetStart={setStartState}
            onToggleAccept={toggleAcceptState}
            onRenameState={renameState}
          />

          <SimulationLog
            simData={simData}
            currentStep={currentStep}
            simResult={simResult}
            simStatus={simStatus}
            inputString={inputString}
          />
        </div>
      </div>

      <TransitionModal
        isOpen={!!transitionModal}
        data={transitionModal}
        mode={mode}
        alphabet={alphabet}
        onSubmit={handleTransitionSubmit}
        onClose={() => setTransitionModal(null)}
      />

      {/* Toast container */}
      <div
        className="fixed bottom-6 right-6 flex flex-col gap-2 z-[9998]"
        style={{ pointerEvents: 'none' }}
      >
        <AnimatePresence>
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'all' }}>
              <Toast
                message={t.message}
                type={t.type}
                onDismiss={() => dismissToast(t.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
