import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitBranch } from 'lucide-react';

export default function TransitionModal({ isOpen, data, mode, alphabet, onSubmit, onClose }) {
  const [label, setLabel] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLabel('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(() => {
    const trimmed = label.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setLabel('');
  }, [label, onSubmit]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  }, [handleSubmit, onClose]);

  if (!isOpen || !data) return null;

  const isDFA = mode === 'DFA';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none"
          >
          <div
            className="w-80 pointer-events-auto"
            style={{
              background: '#0a0f1a',
              border: '1px solid #1a2d47',
              borderRadius: 14,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(41,212,245,0.08)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: '1px solid #1a2d47' }}
            >
              <div className="flex items-center gap-2">
                <GitBranch size={14} style={{ color: '#a78bfa' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e6f2ff', letterSpacing: '0.02em' }}>
                  Add Transition
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center rounded transition-colors"
                style={{ color: '#5c7d99' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 flex flex-col gap-4">
              {/* From → To display */}
              <div className="flex items-center justify-center gap-3">
                <span
                  className="font-mono font-bold px-3 py-1.5 rounded-lg"
                  style={{
                    fontSize: 13,
                    background: 'rgba(41,212,245,0.1)',
                    border: '1px solid rgba(41,212,245,0.25)',
                    color: '#29d4f5',
                  }}
                >
                  {data.from}
                </span>
                <span style={{ color: '#3a5470', fontSize: 18 }}>→</span>
                <span
                  className="font-mono font-bold px-3 py-1.5 rounded-lg"
                  style={{
                    fontSize: 13,
                    background: 'rgba(167,139,250,0.1)',
                    border: '1px solid rgba(167,139,250,0.25)',
                    color: '#a78bfa',
                  }}
                >
                  {data.to}
                </span>
              </div>

              {/* Label input */}
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#ccdae6ff',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                    display: 'block',
                  }}
                >
                  Transition Symbol
                </label>

                {isDFA && alphabet && alphabet.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {alphabet.map(sym => (
                      <button
                        key={sym}
                        onClick={() => onSubmit(sym)}
                        className="font-mono font-bold px-3.5 py-2 rounded-lg transition-all"
                        style={{
                          fontSize: 13,
                          background: 'rgba(41,212,245,0.08)',
                          border: '1px solid rgba(41,212,245,0.2)',
                          color: '#29d4f5',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => {
                          e.target.style.background = 'rgba(41,212,245,0.18)';
                          e.target.style.borderColor = '#29d4f5';
                        }}
                        onMouseLeave={e => {
                          e.target.style.background = 'rgba(41,212,245,0.08)';
                          e.target.style.borderColor = 'rgba(41,212,245,0.2)';
                        }}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={label}
                      onChange={e => setLabel(e.target.value.slice(0, 8))}
                      onKeyDown={handleKeyDown}
                      placeholder="a, b, ε…"
                      className="flex-1 rounded-lg px-3 py-2 font-mono min-w-0"
                      style={{
                        fontSize: 13,
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid #1a2d47',
                        color: '#c4dff0',
                        outline: 'none',
                        caretColor: '#29d4f5',
                      }}
                    />
                    <button
                      onClick={() => onSubmit('ε')}
                      className="font-mono font-bold px-3 py-2 rounded-lg transition-all"
                      style={{
                        fontSize: 14,
                        background: 'rgba(251,191,36,0.1)',
                        border: '1px solid rgba(251,191,36,0.25)',
                        color: '#fbbf24',
                        cursor: 'pointer',
                      }}
                      title="Epsilon (empty) transition"
                    >
                      ε
                    </button>
                  </div>
                )}
              </div>

              {!isDFA && (
                <button
                  onClick={handleSubmit}
                  disabled={!label.trim()}
                  className="w-full py-2.5 rounded-lg font-bold transition-all"
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.05em',
                    background: label.trim() ? 'rgba(41,212,245,0.15)' : 'rgba(15,26,46,0.5)',
                    border: `1px solid ${label.trim() ? '#29d4f5' : '#1a2d47'}`,
                    color: label.trim() ? '#29d4f5' : '#3a5470',
                    cursor: label.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Add Transition
                </button>
              )}
            </div>
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}