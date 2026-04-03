import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, GitBranch, Trash2, MousePointer2,
  ChevronRight, Network, X, Hash,
} from 'lucide-react';

function SidebarButton({ onClick, icon: Icon, label, active, variant = 'default', disabled }) {
  const themes = {
    default: {
      idleBg:     'rgba(10,10,10,0.8)',
      activeBg:   'rgba(41,212,245,0.1)',
      idleBorder: '#1c1c1c',
      activeBorder:'#29d4f5',
      idleColor:  '#f3f3f3',
      activeColor:'#29d4f5',
      glow:       'rgba(41,212,245,0.18)',
    },
    purple: {
      idleBg:     'rgba(10,10,10,0.8)',
      activeBg:   'rgba(167,139,250,0.1)',
      idleBorder: '#1c1c1c',
      activeBorder:'#a78bfa',
      idleColor:  '#f8f8f8',
      activeColor:'#c4b5fd',
      glow:       'rgba(167,139,250,0.18)',
    },
    danger: {
      idleBg:     'rgba(10,10,10,0.8)',
      activeBg:   'rgba(248,113,113,0.1)',
      idleBorder: '#1c1c1c',
      activeBorder:'#f87171',
      idleColor:  '#eef0f1',
      activeColor:'#fca5a5',
      glow:       'rgba(248,113,113,0.18)',
    },
  };

  const t = themes[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.015, x: 1 } : {}}
      whileTap={!disabled ? { scale: 0.975 } : {}}
      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg transition-all"
      style={{
        background: active ? t.activeBg : t.idleBg,
        border: `1px solid ${active ? t.activeBorder : t.idleBorder}`,
        color: active ? t.activeColor : t.idleColor,
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: active ? `0 0 12px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.04)` : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    >
      <Icon size={13} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
      <span>{label}</span>
    </motion.button>
  );
}

function SectionLabel({ title }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-0.5">
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          color: '#fcfcfc',
        }}
      >
        {title}
      </span>
      <div className="flex-1 h-px" style={{ background: '#1a1a1a' }} />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <SectionLabel title={title} />
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function AlphabetSection({ alphabet, onAdd, onRemove, disabled }) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed || trimmed === 'ε') return;
    onAdd(trimmed);
    setInput('');
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: '#eff1f3',
            }}
          >
            Alphabet Σ
          </span>
          <div className="flex-1 h-px w-8" style={{ background: '#1a1a1a' }} />
        </div>
        {alphabet.length > 0 && (
          <span
            className="font-mono"
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.05em',
              padding: '2px 7px',
              borderRadius: 5,
              background: 'rgba(41,212,245,0.08)',
              border: '1px solid rgba(41,212,245,0.22)',
              color: '#29d4f5',
            }}
          >
            |Σ| = {alphabet.length}
          </span>
        )}
      </div>

      {/* Symbol chips */}
      {alphabet.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <AnimatePresence>
            {alphabet.map(sym => (
              <motion.div
                key={sym}
                initial={{ opacity: 0, scale: 0.65 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.65 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg group"
                style={{
                  background: 'rgba(41,212,245,0.08)',
                  border: '1px solid rgba(41,212,245,0.2)',
                }}
              >
                <span
                  className="font-mono"
                  style={{ fontSize: 12, fontWeight: 800, color: '#29d4f5' }}
                >
                  {sym}
                </span>
                {!disabled && (
                  <button
                    onClick={() => onRemove(sym)}
                    className="w-3.5 h-3.5 flex items-center justify-center rounded transition-opacity opacity-30 hover:opacity-100"
                    style={{ color: '#f87171' }}
                  >
                    <X size={9} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Input row */}
      {!disabled && (
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value.slice(0, 4))}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="a, b, 0…"
            className="flex-1 rounded-lg px-3 py-1.5 font-mono min-w-0"
            style={{
              fontSize: 12,
              background: 'rgba(0,0,0,0.9)',
              border: `1px solid ${focused ? '#29d4f5' : '#1c1c1c'}`,
              color: '#c4dff0',
              outline: 'none',
              caretColor: '#29d4f5',
              transition: 'border-color 0.15s',
            }}
          />
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.9 }}
            disabled={!input.trim() || input.trim() === 'ε'}
            className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all"
            style={{
              background: input.trim() ? 'rgba(41,212,245,0.12)' : 'rgba(10,10,10,0.6)',
              border: `1px solid ${input.trim() ? '#29d4f5' : '#1c1c1c'}`,
              color: input.trim() ? '#29d4f5' : '#3a5470',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            <Plus size={13} />
          </motion.button>
        </div>
      )}

      {alphabet.length === 0 && !disabled && (
        <p style={{ fontSize: 11, color: '#eeeeeeff', paddingLeft: 2, marginTop: 4 }}>
          Add symbols to enable transitions.
        </p>
      )}
    </div>
  );
}

/* ── State chip badge ── */
function StateBadge({ label, color, bg, border }) {
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: '0.08em',
        padding: '2px 6px',
        borderRadius: 4,
        background: bg,
        border: `1px solid ${border}`,
        color,
      }}
    >
      {label}
    </span>
  );
}

export default function Sidebar({
  states, transitions,
  canvasMode, onCanvasModeChange,
  onClear,
  onRemoveTransition,
  pendingTransition, onCancelTransition,
  simStatus,
  mode,
  alphabet, onAddAlphabetSymbol, onRemoveAlphabetSymbol,
  isOpen, onClose,
}) {
  const isSimulating = simStatus !== 'idle';

  return (
    <>
      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sidebar-backdrop"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`sidebar-panel ${isOpen ? 'sidebar-open' : ''}`}
        style={{
          background: '#000000',
          borderRight: '1px solid #1a2d47',
          boxShadow: 'inset -1px 0 0 #111111, 2px 0 16px rgba(0,0,0,0.7)',
        }}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between px-3.5 pt-3.5 md:hidden">
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#e2e8f0',
              fontFamily: 'Exo 2',
            }}
          >
            Panel
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              color: '#f87171',
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-3.5 flex-1 overflow-y-auto overflow-x-hidden">

          {/* Build */}
          <Section title="Build">
            <SidebarButton
              onClick={() => onCanvasModeChange(canvasMode === 'addState' ? 'select' : 'addState')}
              icon={Plus}
              label="Add State"
              active={canvasMode === 'addState'}
              disabled={isSimulating}
            />
            <SidebarButton
              onClick={() => {
                if (canvasMode === 'addTransition') {
                  onCancelTransition();
                } else {
                  onCanvasModeChange('addTransition');
                }
              }}
              icon={GitBranch}
              label={pendingTransition ? 'Cancel Transition' : 'Add Transition'}
              active={canvasMode === 'addTransition'}
              variant="purple"
              disabled={isSimulating || states.length < 1 || (mode === 'DFA' && alphabet.length === 0)}
            />
            <SidebarButton
              onClick={() => onCanvasModeChange('select')}
              icon={MousePointer2}
              label="Select / Pan"
              active={canvasMode === 'select'}
            />
          </Section>

          {/* Alphabet — DFA only */}
          {mode === 'DFA' && (
            <AlphabetSection
              alphabet={alphabet}
              onAdd={onAddAlphabetSymbol}
              onRemove={onRemoveAlphabetSymbol}
              disabled={isSimulating}
            />
          )}

          {/* States list */}
          {states.length > 0 && (
            <Section title={`States (${states.length})`}>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid #1a2d47', background: '#0a0a0a' }}
              >
                {states.map((s, i) => {
                  const nameColor = s.isStart
                    ? '#29d4f5'
                    : s.isAccept
                      ? '#34d399'
                      : '#8fb8d8';

                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 px-3 py-2"
                      style={{
                        borderBottom: i < states.length - 1 ? '1px solid #111111' : 'none',
                        background: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent',
                      }}
                    >
                      <span
                        className="font-mono"
                        style={{ fontSize: 13, fontWeight: 700, color: nameColor }}
                      >
                        {s.label}
                      </span>
                      <div className="flex gap-1 ml-auto">
                        {s.isStart && (
                          <StateBadge
                            label="START"
                            color="#29d4f5"
                            bg="rgba(41,212,245,0.1)"
                            border="rgba(41,212,245,0.25)"
                          />
                        )}
                        {s.isAccept && (
                          <StateBadge
                            label="ACC"
                            color="#34d399"
                            bg="rgba(52,211,153,0.1)"
                            border="rgba(52,211,153,0.25)"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 11, color: '#b0b8c2', paddingLeft: 2, marginTop: 3 }}>
                Hover a state for options · Double-click to rename
              </p>
            </Section>
          )}

          {/* Transitions list */}
          {transitions.length > 0 && (
            <Section title={`Transitions (${transitions.length})`}>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid #1a2d47', background: '#0a0a0a' }}
              >
                {transitions.map((t, i) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-1.5 px-2.5 py-2 group"
                    style={{
                      borderBottom: i < transitions.length - 1 ? '1px solid #111111' : 'none',
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent',
                    }}
                  >
                    {/* from */}
                    <span
                      className="font-mono"
                      style={{ fontSize: 12, fontWeight: 600, color: '#8fb8d8' }}
                    >
                      {t.from}
                    </span>

                    <ChevronRight size={9} style={{ color: '#2e4560', flexShrink: 0 }} />

                    {/* label chip */}
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '1px 7px',
                        borderRadius: 5,
                        background: 'rgba(41,212,245,0.08)',
                        border: '1px solid rgba(41,212,245,0.18)',
                        color: '#29d4f5',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {t.label}
                    </span>

                    <ChevronRight size={9} style={{ color: '#2e4560', flexShrink: 0 }} />

                    {/* to */}
                    <span
                      className="font-mono"
                      style={{ fontSize: 12, fontWeight: 600, color: '#8fb8d8' }}
                    >
                      {t.to}
                    </span>

                    <button
                      onClick={() => onRemoveTransition(t.id)}
                      disabled={isSimulating}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#f87171' }}
                      title="Remove transition"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Clear */}
          <Section title="Canvas">
            <SidebarButton
              onClick={onClear}
              icon={Trash2}
              label="Clear All"
              variant="danger"
              disabled={isSimulating || (states.length === 0 && transitions.length === 0)}
            />
          </Section>
        </div>

        {/* Footer stats */}
        <div
          className="px-4 py-3 flex items-center gap-3 shrink-0"
          style={{
            borderTop: '1px solid #1a2d47',
            background: '#000000',
          }}
        >
          <div className="flex items-center gap-1.5">
            <Network size={10} style={{ color: '#eef0f1' }} />
            <span style={{ fontSize: 11, color: '#dce4ec', fontWeight: 500 }}>
              {states.length} states
            </span>
          </div>
          <span style={{ color: '#1c1c1c', fontSize: 12 }}>·</span>
          <span style={{ fontSize: 11, color: '#e3e9ee', fontWeight: 500 }}>
            {transitions.length} transitions
          </span>
          {alphabet.length >= 0 && (
            <>
              <span style={{ color: '#1c1c1c', fontSize: 12 }}>·</span>
              <div className="flex items-center gap-1">
                <Hash size={9} style={{ color: '#f1f4f7' }} />
                <span style={{ fontSize: 11, color: '#f7fbff', fontWeight: 500 }}>
                  {alphabet.length} alphabets
                </span>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}