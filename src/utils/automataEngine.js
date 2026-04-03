/**
 * Automata Engine — DFA and NFA simulation utilities
 */

/**
 * Compute the epsilon-closure of a set of states.
 * Returns all states reachable from the given states via ε-transitions.
 */
export function epsilonClosure(stateIds, transitions) {
  const closure = new Set(stateIds);
  const stack = [...stateIds];

  while (stack.length > 0) {
    const curr = stack.pop();
    transitions
      .filter(t => t.from === curr && t.label === 'ε')
      .forEach(t => {
        if (!closure.has(t.to)) {
          closure.add(t.to);
          stack.push(t.to);
        }
      });
  }

  return [...closure];
}

/**
 * Compute DFA simulation steps.
 * Returns { steps: Step[], accepted: boolean }
 *
 * Each Step: {
 *   stepIndex, activeStates, activeTransitions,
 *   consumed, remaining, symbol, description, dead
 * }
 */
export function computeDFASteps(inputString, startStateId, transitions, states) {
  const steps = [];
  let current = startStateId;

  steps.push({
    stepIndex: 0,
    activeStates: [current],
    activeTransitions: [],
    consumed: '',
    remaining: inputString,
    symbol: null,
    description: `Initial state: ${current}`,
    dead: false,
  });

  if (inputString === '') {
    const finalState = states.find(s => s.id === current);
    return {
      steps,
      accepted: finalState?.isAccept ?? false,
    };
  }

  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];
    const trans = transitions.find(t => t.from === current && t.label === symbol);

    if (!trans) {
      steps.push({
        stepIndex: i + 1,
        activeStates: [],
        activeTransitions: [],
        consumed: inputString.slice(0, i + 1),
        remaining: inputString.slice(i + 1),
        symbol,
        fromState: current,
        description: `No transition from ${current} on '${symbol}' → DEAD STATE`,
        dead: true,
      });
      return { steps, accepted: false };
    }

    steps.push({
      stepIndex: i + 1,
      activeStates: [trans.to],
      activeTransitions: [trans.id],
      consumed: inputString.slice(0, i + 1),
      remaining: inputString.slice(i + 1),
      symbol,
      fromState: current,
      description: `${current} →[${symbol}]→ ${trans.to}`,
      dead: false,
    });

    current = trans.to;
  }

  const finalState = states.find(s => s.id === current);
  const accepted = finalState?.isAccept ?? false;

  return { steps, accepted };
}

/**
 * Compute NFA simulation steps.
 * Returns { steps: Step[], accepted: boolean }
 */
export function computeNFASteps(inputString, startStateId, transitions, states) {
  const steps = [];
  let currentStates = epsilonClosure([startStateId], transitions);

  const ecStr = currentStates.length > 1
    ? ` (ε-closure: {${currentStates.join(', ')}})`
    : '';

  steps.push({
    stepIndex: 0,
    activeStates: currentStates,
    activeTransitions: [],
    consumed: '',
    remaining: inputString,
    symbol: null,
    description: `Initial: {${startStateId}}${ecStr}`,
    dead: false,
  });

  if (inputString === '') {
    const accepted = currentStates.some(id => states.find(s => s.id === id)?.isAccept);
    return { steps, accepted };
  }

  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];
    const nextRaw = new Set();
    const usedTransitions = [];

    currentStates.forEach(stateId => {
      transitions
        .filter(t => t.from === stateId && t.label === symbol)
        .forEach(t => {
          nextRaw.add(t.to);
          usedTransitions.push(t.id);
        });
    });

    const nextStates = epsilonClosure([...nextRaw], transitions);
    const ecExtra = nextStates.length > nextRaw.size && nextRaw.size > 0
      ? ` +ε→ {${nextStates.join(', ')}}`
      : '';

    steps.push({
      stepIndex: i + 1,
      activeStates: nextStates,
      activeTransitions: usedTransitions,
      consumed: inputString.slice(0, i + 1),
      remaining: inputString.slice(i + 1),
      symbol,
      fromStates: currentStates,
      description:
        nextStates.length === 0
          ? `Read '${symbol}': {${currentStates.join(', ')}} → ∅ (DEAD)`
          : `Read '${symbol}': {${currentStates.join(', ')}} → {${[...nextRaw].join(', ')}}${ecExtra}`,
      dead: nextStates.length === 0,
    });

    currentStates = nextStates;
    if (currentStates.length === 0) break;
  }

  const accepted = currentStates.some(id => states.find(s => s.id === id)?.isAccept);
  return { steps, accepted };
}

/**
 * Validate automata configuration
 * @param {Array} states
 * @param {Array} transitions
 * @param {string} mode - 'DFA' | 'NFA'
 * @param {Array} definedAlphabet - user-defined alphabet symbols (DFA only)
 */
export function validateAutomata(states, transitions, mode, definedAlphabet = []) {
  const errors = [];
  const warnings = [];

  if (states.length === 0) {
    errors.push('No states defined.');
    return { errors, warnings };
  }

  const startStates = states.filter(s => s.isStart);
  if (startStates.length === 0) {
    errors.push('No start state defined. Hover a state and click "S" to set it.');
  } else if (startStates.length > 1 && mode === 'DFA') {
    errors.push('DFA must have exactly one start state.');
  }

  if (states.filter(s => s.isAccept).length === 0) {
    errors.push('No accepting states defined. Hover a state and click "A" to set one.');
  }

  if (mode === 'DFA') {
    const epsCount = transitions.filter(t => t.label === 'ε').length;
    if (epsCount > 0) {
      errors.push(`DFA has ${epsCount} ε-transition(s) — switch to NFA mode or remove them.`);
    }

    // Use defined alphabet if available, otherwise infer from transitions
    const alphabet = definedAlphabet.length > 0
      ? definedAlphabet
      : [...new Set(transitions.map(t => t.label).filter(l => l !== 'ε'))];

    // Check for non-determinism (multiple transitions from same state on same symbol)
    alphabet.forEach(symbol => {
      states.forEach(state => {
        const count = transitions.filter(t => t.from === state.id && t.label === symbol).length;
        if (count > 1) {
          errors.push(`DFA conflict: state "${state.id}" has ${count} transitions on '${symbol}'.`);
        }
      });
    });

    // n × m completeness check (only when alphabet is explicitly defined)
    if (definedAlphabet.length > 0 && states.length > 0) {
      const n = states.length;
      const m = definedAlphabet.length;
      const expected = n * m;
      const actual = transitions.filter(t => definedAlphabet.includes(t.label)).length;

      if (actual < expected) {
        // Find exactly which (state, symbol) pairs are missing
        const missing = [];
        states.forEach(state => {
          definedAlphabet.forEach(symbol => {
            const has = transitions.some(t => t.from === state.id && t.label === symbol);
            if (!has) missing.push(`${state.label ?? state.id} on '${symbol}'`);
          });
        });

        errors.push(
          `Incomplete DFA: expected ${expected} transitions (${n} states × ${m} symbols), ` +
          `found ${actual}. Missing: ${missing.slice(0, 3).join('; ')}${missing.length > 3 ? '...' : ''}.`
        );
      }
    }
  }

  return { errors, warnings };
}
